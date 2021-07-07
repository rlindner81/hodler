import type { Context } from "../deps.ts";
import { getMarketQuotes } from "../util/tradier.ts";

const getQuotes = async (ctx: Context) => {
  const { symbols, date } = await ctx.request.body({ type: "json" }).value;
  const { quotes: { quote: result } } = await getMarketQuotes(symbols);
  return result;
};

export { getQuotes };
