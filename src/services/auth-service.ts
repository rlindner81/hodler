import store from "../store.ts";
import { bcrypt, Status } from "../deps.ts";
import type { Context } from "../deps.ts";
import Error from "../errors.ts";

const isLoggedIn = (ctx: Context) =>
  Object.prototype.hasOwnProperty.call(ctx.state.session, "userId");

const login = async (ctx: Context) => {
  const { email, password } = await ctx.request.body({ type: "json" }).value;
  const dbUser = store.readFirst("./users", { email });
  ctx.assert(dbUser !== null, Status.UnprocessableEntity, Error.UserNotFound);
  const match = await bcrypt.compare(password, dbUser.password as string);
  ctx.assert(match, Status.Forbidden, Error.WrongPassword);
  ctx.state.session.userId = dbUser.id;
};

const logout = async (ctx: Context) => {
  Reflect.deleteProperty(ctx.state.session, "userId");
};

const getMe = async (ctx: Context) => {
  const me = store.readFirstAndClone(
    "./users",
    { id: ctx.state.session.userId },
  );
  ctx.assert(me !== null, Status.UnprocessableEntity, Error.UserNotFound);
  Reflect.deleteProperty(me, "id");
  Reflect.deleteProperty(me, "password");
  return me;
};

const updateMe = async (ctx: Context) => {
  const { name, email, password } = await ctx.request.body({ type: "json" })
    .value;
  store.update("./users", {
    ...(name && { name }),
    ...(email && { email }),
    ...(password && { password }),
  }, { id: ctx.state.session.userId });
  const me = store.readFirstAndClone(
    "./users",
    { id: ctx.state.session.userId },
  );
  ctx.assert(me !== null, Status.UnprocessableEntity, Error.UserNotFound);
  Reflect.deleteProperty(me, "id");
  Reflect.deleteProperty(me, "password");
  return me;
};

const register = async (ctx: Context) => {
  const { name, email, password: passwordPlaintext } = await ctx.request.body({ type: "json" })
    .value;
  const emailUsers = store.readFirst(
    "./users",
    { email },
  );
  ctx.assert(emailUsers === null, Status.UnprocessableEntity, Error.UserAlreadyRegistered);
  const password = await bcrypt.hash(passwordPlaintext);
  const newUser = store.create(
    "./users",
    { name, email, password },
  );
  ctx.assert(newUser !== null, Status.UnprocessableEntity, Error.UserNotFound);
  Reflect.deleteProperty(newUser, "id");
  Reflect.deleteProperty(newUser, "password");
  return newUser;
};

export { isLoggedIn, login, logout, getMe, updateMe, register };
