import { Context, Router, RouterOptions } from "../deps.ts";

export default (options?: RouterOptions) => {
  const router: Router = new Router(options);

  router.get("/", (ctx: Context) => {
    ctx.response.body = "You reached hodler server... hold on for dear live\n";
  });

  return router;
};
