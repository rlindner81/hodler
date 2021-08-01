import { exists } from "https://deno.land/std@0.103.0/fs/mod.ts";
import { getMarketHistory } from "../util/tradier.ts";

type Stock = Record<"symbol" | "amount", string>;

const STOCKS_FILE = "data/stocks.json";

const historyDataFileForSymbol = (symbol: string) =>
  `data/history-${symbol}.json`;

const loadHistoryDataForSymbol = async (symbol: string) => {
  const file = historyDataFileForSymbol(symbol);
  if (await exists(file)) {
    console.log("loading data for symbol (cached) %s", symbol);
    const dataRaw = await Deno.readFile(file);
    const dataText = new TextDecoder("utf-8").decode(dataRaw);
    return JSON.parse(dataText);
  }
  console.log("loading data for symbol %s", symbol);

  const data = await getMarketHistory(symbol);
  const dataText = JSON.stringify(data, null, 2) + "\n";
  const dataRaw = new TextEncoder().encode(dataText);
  await Deno.writeFile(file, dataRaw);
  return data;
};

const loadHistoryDataForSymbols = async (list: Array<Stock>) =>
  Object.fromEntries(
    await Promise.all(
      list.map(
        async ({ symbol }) => [symbol, await loadHistoryDataForSymbol(symbol)],
      ),
    ),
  );

const loadQuoteDataForSymbols = async (list: Array<Stock>) => {
  // TODO
};

const main = async () => {
  const stocksRaw = await Deno.readFile(STOCKS_FILE);
  const stocksText = new TextDecoder("utf-8").decode(stocksRaw);
  const stocks: Array<Stock> = JSON.parse(stocksText);
  const allData = await loadHistoryDataForSymbols(stocks);

  const i = 0;
};

main();
