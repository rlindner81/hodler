import { Status } from "../deps.ts";
import config from "../config.ts";
import type { Context } from "../deps.ts";

const API_HEADER = "X-Hodler-Key";

const { hodlerKey } = config;

const checkApiKey = (ctx: Context) => {
  const headers = ctx.request.headers;
  return hodlerKey === headers.get(API_HEADER);
};

const Authenticate = async (ctx: Context, next: () => Promise<unknown>) => {
  ctx.assert(
    checkApiKey(ctx),
    Status.Unauthorized,
  );
  await next();
};

export default Authenticate;
