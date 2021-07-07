import store from "../store.ts";
import type { Context } from "../deps.ts";

const SESSION_COOKIE_KEY = "sid";
const SESSION_COOKIE_LIFETIME_SECONDS = 365 * 24 * 3600; // 1 year

export type Session = Record<"userId", number>;

const SessionMiddleware = async (ctx: Context, next: () => Promise<void>) => {
  const userIdInCookie = ctx.cookies.get(SESSION_COOKIE_KEY);
  const userId = userIdInCookie ? parseInt(userIdInCookie) : null;
  ctx.state.session = { ...(userId && { userId }) };

  await next();

  const oldSessionHasUser = !!userId;
  const newSessionHasUser = Object.prototype.hasOwnProperty.call(
    ctx.state.session,
    "userId",
  );
  if (!oldSessionHasUser && newSessionHasUser) {
    ctx.cookies.set(
      SESSION_COOKIE_KEY,
      String(ctx.state.session.userId),
      { maxAge: SESSION_COOKIE_LIFETIME_SECONDS },
    );
  }
  if (oldSessionHasUser && !newSessionHasUser) {
    ctx.cookies.delete(SESSION_COOKIE_KEY);
  }
};

export default SessionMiddleware;
