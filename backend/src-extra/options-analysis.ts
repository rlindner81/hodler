import * as path from "https://deno.land/std@0.113.0/path/mod.ts";
import {
  getMarketQuotes,
  getOptionChains,
  getOptionExpirations,
} from "../src/util/tradier.ts";
import table from "./table.ts";
import allSymbols from "./options-analysis-symbols.ts";

const DRY_RUN = false;
const MAX_DAYS = 35;
const PRICE_BUFFER = 0.95;
const RISK_CUTOFF = 4;
const CHAIN_LOOKBACK = 3;
const MAX_SPREAD = 0.7;

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

// https://www.nyse.com/markets/hours-calendars
const BANK_HOLIDAYS = [
  Date.UTC(2022, 1-1, 17),
  Date.UTC(2022, 2-1, 21),
  Date.UTC(2022, 4-1, 15),
  Date.UTC(2022, 5-1, 30),
  Date.UTC(2022, 6-1, 20),
  Date.UTC(2022, 7-1, 4),
  Date.UTC(2022, 9-1, 5),
  Date.UTC(2022, 12-1, 26)
]

const _dateDiffInBusinessdays = (from: Date, to: Date) => {
  let count = 0;
  for (let current = new Date(from); current <= to; current.setDate(current.getDate() + 1)) {
    const checkDate = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate());
    if (BANK_HOLIDAYS.includes(checkDate)) {
      continue;
    }
    const dayOfWeek = current.getDay();
    if(dayOfWeek !== 0 && dayOfWeek !== 6) {
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

const _getHighestItmPutChain = (chains: Array<any> | null, quote: any) => {
  if (chains === null) {
    return null;
  }
  const price = (quote.ask + quote.bid) / 2;
  const itmPutChains = chains
    .filter((chain) =>
      chain.strike <= price * PRICE_BUFFER && chain.option_type === "put"
    );
  const len = itmPutChains.length;
  return len > 0 ? itmPutChains[len - 1] : null;
};

const _analyzeChain = (quote: any, chain: any) => {
  const now = new Date();
  const stockPrice = (quote.ask + quote.bid) / 2;
  const strikePrice = chain.strike;
  const chainPrice = (chain.ask + chain.bid) / 2;
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
  const symbols = DRY_RUN
    ? ["GRWG"]
    : cliSymbols.length
    ? cliSymbols
    : allSymbols;
  console.log("checking symbols: %s", symbols.join(","));

  const results: Array<any> = [];
  for (const symbol of symbols) {
    const symbolResults = await _analyzeSymbol(symbol, !!cliSymbols.length);
    results.push(
      ...symbolResults.filter(({ bid, ask, risk }) =>
        risk >= RISK_CUTOFF &&
        (ask - bid) <= MAX_SPREAD
      ),
    );
  }

  const headerRow = [
    "stock",
    "price[$]",
    "type",
    "expiration",
    "strike[$]",
    "bid",
    "last",
    "ask",
    "deposit[$]",
    "gain[$]",
    "risk[%]",
    "bdays",
    "risk/bday",
  ];
  const tableData = [headerRow].concat(
    results.map(
      ({
        stock,
        price,
        type,
        expiration,
        strike,
        bid,
        last,
        ask,
        deposit,
        gain,
        risk,
        businessdays,
        riskPerBusinessday,
      }) => [
        stock,
        price,
        type,
        expiration,
        strike,
        bid,
        last,
        ask,
        deposit,
        gain,
        risk,
        businessdays,
        riskPerBusinessday,
      ],
    ),
  );
  const resultTable = table(tableData, {
    sortCol: 12,
    sortDesc: true,
    columnAlign: "lrllrrrrrrrrr",
    columnType: [
      null,
      "TO_FIXED_TWO",
      null,
      null,
      "TO_FIXED_TWO",
      "TO_FIXED_TWO",
      "TO_FIXED_TWO",
      "TO_FIXED_TWO",
      "TO_FIXED_TWO",
      "TO_FIXED_TWO",
      "TO_FIXED_TWO",
      null,
      "TO_FIXED_TWO",
    ],
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
