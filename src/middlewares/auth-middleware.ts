import { Status } from "../deps.ts";
import type { Context } from "../deps.ts";
import { isLoggedIn } from "../services/auth-service.ts";

const Authenticate = async (ctx: Context, next: () => Promise<void>) => {
  ctx.assert(
    isLoggedIn(ctx),
    Status.Unauthorized,
  );
  await next();
};

export default Authenticate;
