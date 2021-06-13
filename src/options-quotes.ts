import { getMarketQuotes } from "./tradier.ts";

type Stock = Record<"symbol"|"amount", string>;

const SYMBOLS = ["MNMD220121C00005000", "BARK210820C00025000", "AMD220121C00077500"];

const main = async () => {
  const { quotes: { quote: results } } = await getMarketQuotes(SYMBOLS);
  const values = results.map(
    ({ symbol, bid, ask, open, high, low, close }) => 
    ({ symbol, bid: bid.toFixed(2), ask: ask.toFixed(2), open: open.toFixed(2), high: high.toFixed(2), low: low.toFixed(2), close: close.toFixed(2) })
  );
  console.table(values);
};

main();