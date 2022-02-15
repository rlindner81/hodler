import * as path from "https://deno.land/std@0.113.0/path/mod.ts";
import {
  getMarketQuotes,
  getOptionChains,
  getOptionExpirations,
} from "../src/util/tradier.ts";
import table from "./table.ts";
import sourcesForSymbol from "./options-analysis-symbols.ts";

const DRY_RUN = false;
const MAX_DAYS = 35;
const PRICE_BUFFER = 0.95;
const RISK_CUTOFF = 4;
const CHAIN_LOOKBACK = 3;
const MAX_SPREAD = 0.7;

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

interface ColumnInfo {
  header: string;
  field: string;
  alignment: string;
  columnType?: string;
  sort?: boolean;
}


// TODO handle half-days...
// https://www.nyse.com/markets/hours-calendars
const BANK_HOLIDAYS = [
  Date.UTC(2022, 1 - 1, 17),
  Date.UTC(2022, 2 - 1, 21),
  Date.UTC(2022, 4 - 1, 15),
  Date.UTC(2022, 5 - 1, 30),
  Date.UTC(2022, 6 - 1, 20),
  Date.UTC(2022, 7 - 1, 4),
  Date.UTC(2022, 9 - 1, 5),
  Date.UTC(2022, 12 - 1, 26)
]

// TODO should not need loop
const _dateDiffInBusinessdays = (from: Date, to: Date) => {
  let count = 0;
  for (let current = new Date(from); current <= to; current.setDate(current.getDate() + 1)) {
    const checkDate = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate());
    if (BANK_HOLIDAYS.includes(checkDate)) {
      continue;
    }
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
  }
  return count;
};

const _getLatestExpirations = (
  expirations: Array<string> | null,
  limit: number,
  lookback: number,
) => {
  if (expirations === null) {
    return null;
  }
  const now = new Date();
  const dates = expirations
    .map((expiration) => _dateDiffInBusinessdays(now, new Date(expiration)))
    .filter((offset) => offset <= limit);
  const len = dates.length;
  return len === 0 ? null : expirations.slice(Math.max(len - lookback, 0), len);
};

const _getPrice = (quote: any) => Math.min(quote.last, (quote.ask + quote.bid) / 2);

const _getHighestItmPutChain = (chains: Array<any> | null, quote: any) => {
  if (chains === null) {
    return null;
  }
  const price = _getPrice(quote);
  const itmPutChains = chains
    .filter((chain) =>
      chain.strike <= price * PRICE_BUFFER && chain.option_type === "put"
    );
  const len = itmPutChains.length;
  return len > 0 ? itmPutChains[len - 1] : null;
};

const _analyzeChain = (quote: any, chain: any) => {
  const now = new Date();
  const stockPrice = _getPrice(quote);
  const strikePrice = chain.strike;
  const chainPrice = _getPrice(chain);
  const risk = chainPrice / strikePrice * 100;
  const businessdays = _dateDiffInBusinessdays(now, new Date(chain.expiration_date));
  return {
    stock: quote.symbol,
    price: stockPrice,
    type: chain.option_type,
    expiration: chain.expiration_date,
    strike: chain.strike,
    bid: chain.bid,
    last: chain.last,
    ask: chain.ask,
    deposit: 100 * chain.strike,
    gain: 100 * chainPrice,
    risk,
    businessdays,
    riskPerBusinessday: risk / businessdays,
  };
};

const _jsonFromFile = async (filepath: string) =>
  JSON.parse(
    new TextDecoder("utf-8").decode(
      await Deno.readFile(path.join(__dirname, ...filepath.split("/"))),
    ),
  );

const _analyzeSymbol = async (symbol: string, isCliSymbols: boolean) => {
  // console.log("analyzing symbol %s", symbol);
  const results: Array<any> = [];
  const [quote] = DRY_RUN
    ? await _jsonFromFile("../temp/market-quotes-response.json")
    : await getMarketQuotes([symbol]);

  const expirations = DRY_RUN
    ? await _jsonFromFile("../temp/option-expirations-response.json")
    : await getOptionExpirations(symbol);
  const latestExpirations = isCliSymbols
    ? expirations
    : _getLatestExpirations(expirations, MAX_DAYS, CHAIN_LOOKBACK);
  if (latestExpirations === null) {
    console.warn("could not find latest expirations for %s", symbol);
    return results;
  }

  for (const expiration of latestExpirations) {
    const chains = DRY_RUN
      ? await _jsonFromFile("../temp/option-chains-response.json")
      : await getOptionChains(symbol, expiration);
    const chain = _getHighestItmPutChain(chains, quote);
    if (chain === null) {
      console.warn("could not find highest itm put chain for %s", symbol);
      break;
    }
    const result = _analyzeChain(quote, chain);
    result && results.push(result);
  }

  return results;
};

const main = async () => {
  const cliSymbols = Deno.args.slice().sort();
  const hasCliSymbols = !!cliSymbols.length;
  const symbols = DRY_RUN
    ? ["GRWG"]
    : cliSymbols.length
      ? cliSymbols
      : Object.keys(sourcesForSymbol);
  console.log("checking symbols: %s", symbols.join(","));

  const results: Array<any> = [];
  for (const symbol of symbols) {
    const sources = hasCliSymbols ? ["CLI"] : sourcesForSymbol[symbol];
    const symbolResults = await _analyzeSymbol(symbol, hasCliSymbols);
    results.push(
      ...symbolResults.filter(({bid, ask, risk}) =>
        risk >= RISK_CUTOFF &&
        (ask - bid) <= MAX_SPREAD
      ).map(result => ({...result, sources,})),
    );
  }

  const columnInfos = ([] as ColumnInfo[]).concat(hasCliSymbols ? [] : [
    {
      header: "sources",
      field: "sources",
      alignment: "l",
    },
  ], <Array<ColumnInfo>>[
    {
      header: "stock",
      field: "stock",
      alignment: "l",
    },
    {
      header: "price[$]",
      field: "price",
      alignment: "r",
      columnType: "TO_FIXED_TWO"
    },
    {
      header: "expiration",
      field: "expiration",
      alignment: "l",
    },
    {
      header: "strike[$]",
      field: "strike",
      alignment: "r",
      columnType: "TO_FIXED_TWO"
    },
    {
      header: "bid",
      field: "bid",
      alignment: "r",
      columnType: "TO_FIXED_TWO"
    },
    {
      header: "last",
      field: "last",
      alignment: "r",
      columnType: "TO_FIXED_TWO"
    },
    {
      header: "ask",
      field: "ask",
      alignment: "r",
      columnType: "TO_FIXED_TWO"
    },
    {
      header: "deposit[$]",
      field: "deposit",
      alignment: "r"
    },
    {
      header: "gain[$]",
      field: "gain",
      alignment: "r",
      columnType: "TO_FIXED_TWO"
    },
    {
      header: "risk[%]",
      field: "risk",
      alignment: "r",
      columnType: "TO_FIXED_TWO"
    },
    {
      header: "bdays",
      field: "businessdays",
      alignment: "r",
    },
    {
      header: "risk/bday",
      field: "riskPerBusinessday",
      alignment: "r",
      columnType: "TO_FIXED_TWO",
      sort: true
    },
  ]);

  const headerRow = columnInfos.map(({header}) => header);
  const tableData: Array<any> = [headerRow].concat(
    results.map(result => columnInfos.map(({field}) => result[field])),
  );
  const resultTable = table(tableData, {
    sortCol: columnInfos.findIndex(({sort}) => sort),
    sortDesc: true,
    columnAlign: columnInfos.map(({alignment}) => alignment).join(""),
    columnType: columnInfos.map(({columnType}) => columnType),
  });
  console.log(resultTable);
  if (cliSymbols.length === 0 && resultTable) {
    const filepath = `hodler-${
      new Date().toISOString().replace(/[:.]/g, "-")
    }.txt`;
    await Deno.writeTextFile(filepath, resultTable);
  }
};

await main();
