import { Application } from "./deps.ts";
import store from "./store.ts";
import RootRouter from "./routes/root-route.ts";
import QuoteRouter from "./routes/quote-route.ts";

const envCookieKey = Deno.env.get("COOKIE_KEY");
const envPort = Deno.env.get("PORT");
const appOptions = envCookieKey ? { keys: [envCookieKey] } : {};

const app = new Application(appOptions);
const port = envPort ? parseInt(envPort) : 8080;

await store.initialize();

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);
    ctx.response.status = err.status;
    ctx.response.body = err.message;
  }
});

const rootRouter = RootRouter({ prefix: "/" });
app.use(rootRouter.allowedMethods());
app.use(rootRouter.routes());

const quoteRouter = QuoteRouter({ prefix: "/api/quote" });
app.use(quoteRouter.allowedMethods());
app.use(quoteRouter.routes());

console.log("listening on port %d", port);
await app.listen({ port });
