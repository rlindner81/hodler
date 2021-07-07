import store from "../store.ts";
import type { Context } from "../deps.ts";

const getQuotes = async (ctx: Context) => {
  // const users = store.readAndClone("./users");

  return {
    you: "got it"
  };
};

export { getQuotes };
