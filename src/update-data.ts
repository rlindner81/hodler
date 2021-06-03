import { exists } from "https://deno.land/std@0.97.0/fs/mod.ts";
import { getMarketHistory } from "./tradier.ts";

type Stock = Record<"symbol", string>;

const STOCKS: Array<Stock> = [
  { symbol: "BARK" },
  { symbol: "CRSR" },
  { symbol: "STOR" },
  { symbol: "BOWX" },
  { symbol: "CCL" },
  { symbol: "CCIV" },
  { symbol: "PLTR" },
  { symbol: "TWTR" },
  { symbol: "AMD" },
  { symbol: "DIS" },
  // CD PROJEKT
];

const dataFileForSymbol = (symbol: string) => `data-${symbol}.json`;

const loadDataForSymbol = async (symbol: string) => {
  const file = dataFileForSymbol(symbol);
  if (await exists(file)) {
    const dataRaw = await Deno.readFile(file);
    const dataText = new TextDecoder("utf-8").decode(dataRaw);
    return JSON.parse(dataText);
  }

  const data = await getMarketHistory(symbol);
  const dataText = JSON.stringify(data, null, 2) + "\n";
  const dataRaw = new TextEncoder().encode(dataText);
  await Deno.writeFile(file, dataRaw);
  return data;
};

const loadDataForSymbols = async (list: Array<Stock>) =>
  await Promise.all(list.map(({ symbol }) => loadDataForSymbol(symbol)));

const main = async () => {
  const data = await loadDataForSymbols(STOCKS);
  console.log(data);
  const i = 0;
};

main();
