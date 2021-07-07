import { Context, Router, RouterOptions, Status } from "../deps.ts";
import { getUsers } from "../services/cup-service.ts";
import auth from "../middlewares/auth-middleware.ts";
// import validate from "../middlewares/validaton-middleware.ts";
// import {
//   loginSchema,
//   meSchema,
//   registerSchema,
// } from "../validations/auth-schemas.ts";

export default (options?: RouterOptions) => {
  const router: Router = new Router(options);

  router.get("/users", auth, async (ctx: Context) => {
    const users = await getUsers(ctx);
    ctx.response.body = users;
  });

  return router;
};
