import { Context, Router, RouterOptions } from "../deps.ts";
import { getQuotes } from "../services/quote-service.ts";
import auth from "../middlewares/auth-middleware.ts";
import validate from "../middlewares/validaton-middleware.ts";
import { quoteSchema } from "../validations/quote-schemas.ts";

export default (options?: RouterOptions) => {
  const router: Router = new Router(options);

  router.get("/", auth, validate(quoteSchema), async (ctx: Context) => {
    const quotes = await getQuotes(ctx);
    ctx.response.body = quotes;
  });

  return router;
};
