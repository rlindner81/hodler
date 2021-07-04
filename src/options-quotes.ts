import {getMarketQuotes, getMarketHistory} from "./tradier.ts";
import table from "./table.ts";

type Stock = Record<"symbol" | "amount", string>;

const SYMBOLS = [
  "AMD220121C00077500",
  "BARK210820C00025000",
  "CCL220121C00012500",
  "MNMD220121C00005000",
];

const getMarketResults = async () => {
  const {quotes: {quote: results}} = await getMarketQuotes(SYMBOLS);
  return results;
}

const getHistoricResults = async (date: Date) => {
  const results = [];
  for (const symbol of SYMBOLS) {
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - 10);
    const { history } = await getMarketHistory(symbol, startDate, date);
    if (history === null) {
      continue;
    }
    const { day } = history;
    const result = day[day.length - 1];
    results.push({
      symbol,
      ...result
    })
  }
  return results;
}

const main = async () => {
  // const results = await getHistoricResults(new Date(Date.UTC(2021, 0, 1))
  const results = await getMarketResults();

  const headerRow = ["symbol", "bid", "ask", "open", "high", "low", "close"];
  const tableData = [headerRow].concat(
    results.map(
      ({symbol, bid, ask, open, high, low, close}) =>
        [
          symbol,
          bid ? bid.toFixed(2) : "",
          ask ? ask.toFixed(2) : "",
          open ? open.toFixed(2) : "",
          high ? high.toFixed(2) : "",
          low ? low.toFixed(2) : "",
          close ? close.toFixed(2): ""
        ]
    )
  );
  console.log(table(tableData, {
    sortCol: null,
    columnAlign: "lrrrrrr"
  }));
};

await main();
