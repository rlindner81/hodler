import { Status } from "../deps.ts";
import type { Context } from "../deps.ts";

const API_KEY = Deno.env.get("HODLER_APIKEY");
const API_HEADER = "X-Hodler-Key";

const checkApiKey = (ctx: Context) => {
  const headers = ctx.request.headers;
  return API_KEY === headers.get(API_HEADER);
};

const Authenticate = async (ctx: Context, next: () => Promise<unknown>) => {
  ctx.assert(
    checkApiKey(ctx),
    Status.Unauthorized,
  );
  await next();
};

export default Authenticate;
