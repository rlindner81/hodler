import { exists } from "https://deno.land/std@0.97.0/fs/mod.ts";
import { getMarketHistory } from "./tradier.ts";

const DATA_FILE = "data-stic.json";
const STOCKS = [
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

const loadData = async () => {
  if (await exists(DATA_FILE)) {
    const dataRaw = await Deno.readFile(DATA_FILE);
    const dataText = new TextDecoder("utf-8").decode(dataRaw);
    return JSON.parse(dataText);
  }

  // const symbols = STOCKS.map(({ symbol }) => symbol);
  // const data = await getMarketQuotes(symbols);

  const symbol = "STIC";
  const data = await getMarketHistory(symbol);
  const dataText = JSON.stringify(data, null, 2) + "\n";
  const dataRaw = new TextEncoder().encode(dataText);
  await Deno.writeFile(DATA_FILE, dataRaw);
  return data;
};

const main = async () => {
  const data = await loadData();
  console.log(data);
  const i = 0;
};

main();
