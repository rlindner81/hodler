import {getMarketQuotes, getOptionExpirations, getOptionChains} from "../src/util/tradier.ts";
import table from "./table.ts";

const SYMBOLS = [
  "AMD",
  "BARK",
  "CCL",
  "GRWG",
  "MNMD",
  "NIO",
  "PLTR",
  "WE",
];

const EXPIRY_RANGE_DAYS = 35;
const PRICE_BUFFER = 0.95;

// const getMarketResults = async () => {
//   const { quotes: { quote: results } } = await getMarketQuotes(SYMBOLS);
//   return results;
// };
//
// const getHistoricResults = async (date: Date) => {
//   const results = [];
//   for (const symbol of SYMBOLS) {
//     const startDate = new Date(date);
//     startDate.setDate(startDate.getDate() - 10);
//     const { history } = await getMarketHistory(symbol, startDate, date);
//     if (history === null) {
//       continue;
//     }
//     const { day } = history;
//     const result = day[day.length - 1];
//     results.push({
//       symbol,
//       ...result,
//     });
//   }
//   return results;
// };
//
// const readArgs = () => {
//   const historyIndex = Deno.args.indexOf("--history");
//   const doHistory = historyIndex !== -1;
//   if (Deno.args.length <= historyIndex + 1) {
//     return {
//       doHistory,
//       historyDate: new Date(Date.UTC(2021, 0, 1)),
//     };
//   }
//
//   const historyDateRaw = Deno.args[historyIndex + 1];
//   const [, year, month, day] = /(\d{4})-(\d{2})-(\d{2})/.exec(historyDateRaw) ||
//     [];
//   const historyDate = new Date(
//     Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)),
//   );
//   return {
//     doHistory,
//     historyDate,
//   };
// };

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

const _getHighestItmChain = (quote: any, chains: Array<any>) => {
  const price = (quote.ask + quote.bid) / 2;
  const itmPutChains = chains
    .filter(chain => chain.strike <= price * PRICE_BUFFER && chain.option_type === "put");
  return itmPutChains[itmPutChains.length - 1];
}

const _analyzeChain = (quote: any, chain: any) => {
  const stockPrice = (quote.ask + quote.bid) / 2;
  const chainPrice = (chain.ask + chain.bid) / 2;
  return {
    stock: quote.symbol,
    chain: chain.description,
    deposit: (100 * stockPrice).toFixed(2),
    gain: (100 * chainPrice).toFixed(2),
    riskPercent: (chainPrice / stockPrice * 100).toFixed(2)
  }
}

const _analyzeSymbol = async (symbol: string) => {
  // console.log("analyzing symbol %s", symbol);
  // const [quote] = await getMarketQuotes([symbol]);
  const [quote] = JSON.parse(new TextDecoder("utf-8").decode(await Deno.readFile("market-quotes-response.json")));

  // const expirations = await getOptionExpirations(symbol);
  const expirations = JSON.parse(new TextDecoder("utf-8").decode(await Deno.readFile("option-expirations-response.json")));
  const expiration = _getLatestExpiration(EXPIRY_RANGE_DAYS, expirations);
  if (expiration === null) {
    console.warn("could not find latest expiration for %s", symbol);
    return;
  }
  // const chains = await getOptionChains(symbol, expiration);
  const chains = JSON.parse(new TextDecoder("utf-8").decode(await Deno.readFile("option-chains-response.json")));

  const chain = _getHighestItmChain(quote, chains);

  return _analyzeChain(quote, chain);
}

const main = async () => {
  const results = [];
  for (const symbol of SYMBOLS) {
    const result = await _analyzeSymbol(symbol);
    result && results.push(result);
  }

  const headerRow = ["stock", "chain", "deposit", "gain", "riskPercent"];
  const tableData = [headerRow].concat(
    results.map(
      ({stock, chain, deposit, gain, riskPercent}) => [
        stock,
        chain,
        deposit ?? "",
        gain ?? "",
        riskPercent ?? "",
      ],
    ),
  );
  console.log(table(tableData, {
    sortCol: 4,
    columnAlign: "llrrr",
  }));
};

await main();
