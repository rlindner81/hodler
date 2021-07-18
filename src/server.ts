import { Application, Context } from "./deps.ts";
import store from "./store.ts";
import RootRouter from "./routes/root-route.ts";
import QuoteRouter from "./routes/quote-route.ts";

const envPort = Deno.env.get("PORT");

const newApp = () => {
  const cookieKey = Deno.env.get("COOKIE_KEY");
  const proxy = /^t(?:rue)?$/.test(Deno.env.get("PROXY") ?? "");
  const appOptions = {
    ...(proxy && { proxy }),
    ...(cookieKey && { keys: [cookieKey] }),
  };

  proxy && console.log("server config .proxy %s", proxy);
  cookieKey && console.log("server config .cookieKey %s", cookieKey.replace(/./g, "*"));
  return new Application(appOptions);
}

const app = newApp();
const port = envPort ? parseInt(envPort) : 8080;

await store.initialize();

app.use(async (ctx: Context, next: () => Promise<unknown>) => {
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
