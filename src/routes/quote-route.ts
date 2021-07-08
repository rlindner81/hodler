import { Context, Router, RouterOptions } from "../deps.ts";
import { getLiveQuotes, getHistoricQuotes } from "../services/quote-service.ts";
import auth from "../middlewares/auth-middleware.ts";
import validate from "../middlewares/validaton-middleware.ts";
import { liveQuoteSchema, historicQuoteSchema } from "../validations/quote-schemas.ts";

export default (options?: RouterOptions) => {
  const router: Router = new Router(options);

  router.get("/live", auth, validate(liveQuoteSchema), async (ctx: Context) => {
    const quotes = await getLiveQuotes(ctx);
    ctx.response.body = quotes;
  });

  router.get("/historic", auth, validate(historicQuoteSchema), async (ctx: Context) => {
    const quotes = await getHistoricQuotes(ctx);
    ctx.response.body = quotes;
  });

  return router;
};
