interface Config {
  port: number;
  proxy: boolean;
  cookieKey?: string;
  hodlerKey?: string;
  tradierKey?: string;
}

const setConfigFromEnv = (): Config => {
  const envPort = Deno.env.get("PORT");
  const port = envPort ? parseInt(envPort) : 8080;

  const envProxy = Deno.env.get("PROXY");
  const proxy = envProxy ? /^t(?:rue)?$/.test(envProxy) : false;

  const cookieKey = Deno.env.get("COOKIE_KEY");
  const hodlerKey = Deno.env.get("HODLER_APIKEY");
  const tradierKey = Deno.env.get("TRADIER_APIKEY");

  return {
    port,
    proxy,
    ...(cookieKey && { cookieKey }),
    ...(hodlerKey && { hodlerKey }),
    ...(tradierKey && { tradierKey }),
  };
};

const config: Config = setConfigFromEnv();

const logConfig = () => {
  const { port, proxy, cookieKey, hodlerKey, tradierKey } = config;
  console.log("config .port %s", port);
  console.log("config .proxy %s", proxy);
  cookieKey && console.log("config .cookieKey");
  hodlerKey && console.log("config .hodlerKey");
  tradierKey && console.log("config .tradierKey");
};

export { config as default, logConfig };
