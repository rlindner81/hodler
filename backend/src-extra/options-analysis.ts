import {getMarketQuotes, getOptionExpirations, getOptionChains} from "../src/util/tradier.ts";
import table from "./table.ts";

const SYMBOLS = [
  "GRWG",
  "NIO",
  // "AMD",
  // "BARK",
  // "CCL",
  // "MNMD",
  // "PLTR",
  // "WE",
  // "TTCF",
  // "CRSR",
  // "STOR",
  // "CCL",
  // "DIS",
  // "BABA",
  // "LCID",
  // "ATVI",
  // "DWAC",
  // "WYNN",
  // "ME",
  // "TWTR",
  // "COUR",
  // "AXON",
  // "RBLX",
  // "PTON"
];

const EXPIRY_RANGE_DAYS = 35;
const PRICE_BUFFER = 0.95;
const MILLIS_IN_DAYS = 1000 * 60 * 60 * 24;

const _dateDiffInDays = (a: Date, b: Date) => {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utc2 - utc1) / MILLIS_IN_DAYS);
}

const _getLatestExpiration = (limit: number, expirations: Array<string>) => {
  const now = new Date();
  const dates = expirations
    .map((expiration) => _dateDiffInDays(now, new Date(expiration)))
    .filter(offset => offset <= limit);
  return dates.length > 0 ? expirations[dates.length - 1] : null;
}

const _getHighestItmPutChain = (quote: any, chains: Array<any>) => {
  const price = (quote.ask + quote.bid) / 2;
  const itmPutChains = chains
    .filter(chain => chain.strike <= price * PRICE_BUFFER && chain.option_type === "put");
  return itmPutChains.length > 0 ? itmPutChains[itmPutChains.length - 1] : null;
}

const _analyzeChain = (quote: any, chain: any) => {
  const stockPrice = (quote.ask + quote.bid) / 2;
  const strikePrice = chain.strike;
  const chainPrice = (chain.ask + chain.bid) / 2;
  return {
    stock: quote.symbol,
    price: stockPrice,
    chain: chain.description,
    deposit: 100 * chain.strike,
    gain: 100 * chainPrice,
    risk: chainPrice / strikePrice * 100
  }
}

const _analyzeSymbol = async (symbol: string) => {
  // console.log("analyzing symbol %s", symbol);
  const [quote] = await getMarketQuotes([symbol]);
  // const [quote] = JSON.parse(new TextDecoder("utf-8").decode(await Deno.readFile("../temp/market-quotes-response.json")));

  const expirations = await getOptionExpirations(symbol);
  // const expirations = JSON.parse(new TextDecoder("utf-8").decode(await Deno.readFile("../temp/option-expirations-response.json")));
  const expiration = _getLatestExpiration(EXPIRY_RANGE_DAYS, expirations);
  if (expiration === null) {
    console.warn("could not find latest expiration for %s", symbol);
    return;
  }
  const chains = await getOptionChains(symbol, expiration);
  // const chains = JSON.parse(new TextDecoder("utf-8").decode(await Deno.readFile("../temp/option-chains-response.json")));
  const chain = _getHighestItmPutChain(quote, chains);
  if (chain === null) {
    console.warn("could not find highest itm put chain for %s", symbol);
    return;
  }

  return _analyzeChain(quote, chain);
}

const main = async () => {
  const results = [];
  for (const symbol of SYMBOLS) {
    const result = await _analyzeSymbol(symbol);
    result && results.push(result);
  }

  const headerRow = ["stock", "price[$]", "chain", "deposit[$]", "gain[$]", "risk[%]"];
  const tableData = [headerRow].concat(
    results.map(
      ({stock, price, chain, deposit, gain, risk}) => [stock, price, chain, deposit, gain, risk,],
    ),
  );
  console.log(table(tableData, {
    sortCol: 5,
    sortDesc: true,
    columnAlign: "lrlrrr",
    columnType: [null, "TO_FIXED_TWO", null, "TO_FIXED_TWO", "TO_FIXED_TWO", "TO_FIXED_TWO"]
  }));
};

await main();
