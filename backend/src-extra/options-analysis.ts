import * as path from "https://deno.land/std@0.113.0/path/mod.ts";
import {
  getMarketQuotes,
  getOptionChains,
  getOptionExpirations,
} from "../src/util/tradier.ts";
import table from "./table.ts";
import symbols from "./options-analysis-symbols.ts";

const DRY_RUN = false;
const MAX_DAYS = 35;
const PRICE_BUFFER = 0.95;
const RISK_CUTOFF = 4;
const CHAIN_LOOKBACK = 3;

const MILLIS_IN_DAYS = 1000 * 60 * 60 * 24;
const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

const _dateDiffInDays = (a: Date, b: Date) => {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utc2 - utc1) / MILLIS_IN_DAYS);
};

const _getLatestExpirations = (
  expirations: Array<string> | null,
  limit: number,
) => {
  if (expirations === null) {
    return null;
  }
  const now = new Date();
  const dates = expirations
    .map((expiration) => _dateDiffInDays(now, new Date(expiration)))
    .filter((offset) => offset <= limit);
  const len = dates.length;
  return len === 0
    ? null
    : expirations.slice(Math.max(len - CHAIN_LOOKBACK, 0), len);
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
  const days = _dateDiffInDays(now, new Date(chain.expiration_date));
  return {
    stock: quote.symbol,
    price: stockPrice,
    type: chain.option_type,
    expiration: chain.expiration_date,
    strike: chain.strike,
    deposit: 100 * chain.strike,
    gain: 100 * chainPrice,
    risk,
    days,
    riskPerDay: risk/days
  };
};

const _jsonFromFile = async (filepath: string) =>
  JSON.parse(
    new TextDecoder("utf-8").decode(
      await Deno.readFile(path.join(__dirname, ...filepath.split("/"))),
    ),
  );

const _analyzeSymbol = async (symbol: string) => {
  // console.log("analyzing symbol %s", symbol);
  const results: Array<any> = [];
  const [quote] = DRY_RUN
    ? await _jsonFromFile("../temp/market-quotes-response.json")
    : await getMarketQuotes([symbol]);

  const expirations = DRY_RUN
    ? await _jsonFromFile("../temp/option-expirations-response.json")
    : await getOptionExpirations(symbol);
  const latestExpirations = _getLatestExpirations(expirations, MAX_DAYS);
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
  const results = [];
  for (const symbol of DRY_RUN ? ["GRWG"] : symbols) {
    const symbolResults = await _analyzeSymbol(symbol);
    results.push(
      ...symbolResults.filter((symbolResult) =>
        symbolResult.risk > RISK_CUTOFF
      ),
    );
  }

  const headerRow = [
    "stock",
    "price[$]",
    "type",
    "expiration",
    "strike[$]",
    "deposit[$]",
    "gain[$]",
    "risk[%]",
    "days",
    "risk/day",
  ];
  const tableData = [headerRow].concat(
    results.map(
      ({
        stock,
        price,
        type,
        expiration,
        strike,
        deposit,
        gain,
        risk,
        days,
        riskPerDay,
      }) => [stock, price, type, expiration, strike, deposit, gain, risk, days, riskPerDay],
    ),
  );
  console.log(table(tableData, {
    sortCol: 9,
    sortDesc: true,
    columnAlign: "lrllrrrrrr",
    columnType: [
      null,
      "TO_FIXED_TWO",
      null,
      null,
      "TO_FIXED_TWO",
      "TO_FIXED_TWO",
      "TO_FIXED_TWO",
      "TO_FIXED_TWO",
      null,
      "TO_FIXED_TWO",
    ],
  }));
};

await main();
