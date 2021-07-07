import store from "../store.ts";
import { Status } from "../deps.ts";
import type { Context } from "../deps.ts";

const getUsers = async (ctx: Context) => {
  const users = store.readAndClone("./users");
  return users?.map((user) => {
    Reflect.deleteProperty(user, "id");
    Reflect.deleteProperty(user, "password");
    return user;
  });
};

export { getUsers };
