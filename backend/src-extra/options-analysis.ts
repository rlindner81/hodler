import {getMarketQuotes, getOptionExpirations, getOptionChains} from "../src/util/tradier.ts";
import table from "./table.ts";
import symbols from "./options-analysis-symbols.ts";

const EXPIRY_RANGE_DAYS = 35;
const PRICE_BUFFER = 0.95;
const MILLIS_IN_DAYS = 1000 * 60 * 60 * 24;
const DRY_RUN = true;

const _dateDiffInDays = (a: Date, b: Date) => {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utc2 - utc1) / MILLIS_IN_DAYS);
}

const _getLatestExpiration = (expirations: Array<string> | null, limit: number) => {
  if (expirations === null) {
    return null;
  }
  const now = new Date();
  const dates = expirations
    .map((expiration) => _dateDiffInDays(now, new Date(expiration)))
    .filter(offset => offset <= limit);
  return dates.length > 0 ? expirations[dates.length - 1] : null;
}

const _getHighestItmPutChain = (chains: Array<any> | null, quote: any) => {
  if (chains === null) {
    return null;
  }
  const price = (quote.ask + quote.bid) / 2;
  const itmPutChains = chains
    .filter(chain => chain.strike <= price * PRICE_BUFFER && chain.option_type === "put");
  return itmPutChains.length > 0 ? itmPutChains[itmPutChains.length - 1] : null;
}

const _analyzeChain = (quote: any, chain: any) => {
  const now = new Date();
  const stockPrice = (quote.ask + quote.bid) / 2;
  const strikePrice = chain.strike;
  const chainPrice = (chain.ask + chain.bid) / 2;
  return {
    stock: quote.symbol,
    price: stockPrice,
    // chain: chain.description,
    type: chain.option_type,
    expiration: chain.expiration_date,
    strike: chain.strike,
    deposit: 100 * chain.strike,
    gain: 100 * chainPrice,
    risk: chainPrice / strikePrice * 100,
    days: _dateDiffInDays(now, new Date(chain.expiration_date))
  }
}

const _analyzeSymbol = async (symbol: string) => {
  // console.log("analyzing symbol %s", symbol);
  const [quote] = DRY_RUN
    ? JSON.parse(new TextDecoder("utf-8").decode(await Deno.readFile("../temp/market-quotes-response.json")))
    : await getMarketQuotes([symbol]);

  const expirations = DRY_RUN
    ? JSON.parse(new TextDecoder("utf-8").decode(await Deno.readFile("../temp/option-expirations-response.json")))
    : await getOptionExpirations(symbol);
  const expiration = _getLatestExpiration(expirations, EXPIRY_RANGE_DAYS);
  if (expiration === null) {
    console.warn("could not find latest expiration for %s", symbol);
    return;
  }
  const chains = DRY_RUN
    ? JSON.parse(new TextDecoder("utf-8").decode(await Deno.readFile("../temp/option-chains-response.json")))
    : await getOptionChains(symbol, expiration);
  const chain = _getHighestItmPutChain(chains, quote);
  if (chain === null) {
    console.warn("could not find highest itm put chain for %s", symbol);
    return;
  }

  return _analyzeChain(quote, chain);
}

const main = async () => {
  const results = [];
  for (const symbol of DRY_RUN ? ["GRWG"] : symbols) {
    const result = await _analyzeSymbol(symbol);
    result && results.push(result);
  }

  const headerRow = ["stock", "price[$]", "type", "expiration", "strike[$]", "deposit[$]", "gain[$]", "risk[%]", "days"];
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
         days
       }) => [stock, price, type, expiration, strike, deposit, gain, risk, days],
    ),
  );
  console.log(table(tableData, {
    sortCol: 7,
    sortDesc: true,
    columnAlign: "lrllrrrrr",
    columnType: [null, "TO_FIXED_TWO", null, null, "TO_FIXED_TWO", "TO_FIXED_TWO", "TO_FIXED_TWO", "TO_FIXED_TWO"]
  }));
};

await main();
