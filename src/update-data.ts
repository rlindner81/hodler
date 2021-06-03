import { exists } from "https://deno.land/std@0.97.0/fs/mod.ts";
import { getMarketHistory } from "./tradier.ts";

type Stock = Record<"symbol", string>;

const STOCKS_FILE = "data/stocks.json";

const dataFileForSymbol = (symbol: string) => `data/data-${symbol}.json`;

const loadDataForSymbol = async (symbol: string) => {
  const file = dataFileForSymbol(symbol);
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

const loadDataForSymbols = async (list: Array<Stock>) =>
  await Promise.all(list.map(({ symbol }) => loadDataForSymbol(symbol)));

const main = async () => {
  const stocksRaw = await Deno.readFile(STOCKS_FILE);
  const stocksText = new TextDecoder("utf-8").decode(stocksRaw);
  const stocks: Array<Stock> = JSON.parse(stocksText);
  await loadDataForSymbols(stocks);
  const i = 0;
};

main();
