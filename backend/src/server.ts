import { Application, Context } from "./deps.ts";
import store from "./store.ts";
import { default as config, logConfig } from "./config.ts";
import RootRouter from "./routes/root-route.ts";
import QuoteRouter from "./routes/quote-route.ts";

logConfig();
const { port, proxy, cookieKey } = config;

const app = new Application({
  proxy,
  ...(cookieKey && { keys: [cookieKey] }),
});

await store.initialize();

app.use(async (ctx: Context, next: () => Promise<unknown>) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    ctx.response.status = err.status;
    ctx.response.body = err.message + "\n";
  }
});

const rootRouter = RootRouter({ prefix: "/api" });
app.use(rootRouter.allowedMethods());
app.use(rootRouter.routes());

const quoteRouter = QuoteRouter({ prefix: "/api/quote" });
app.use(quoteRouter.allowedMethods());
app.use(quoteRouter.routes());

console.log("listening on port %d", port);
await app.listen({ port });
