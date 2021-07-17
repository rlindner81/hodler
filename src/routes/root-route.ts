import { Context, Router, RouterOptions } from "../deps.ts";
import { getHistoricQuotes, getLiveQuotes } from "../services/quote-service.ts";
import auth from "../middlewares/auth-middleware.ts";
import validate from "../middlewares/validaton-middleware.ts";
import {
  historicQuoteSchema,
  liveQuoteSchema,
} from "../validations/quote-schemas.ts";

export default (options?: RouterOptions) => {
  const router: Router = new Router(options);

  router.get("/", async (ctx: Context) => {
    ctx.response.body = "You reached hodler server... hold on for dear live";
  });

  return router;
};
