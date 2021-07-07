import { Context, Router, RouterOptions, Status } from "../deps.ts";
import {
  login,
  logout,
  getMe,
  updateMe,
  register,
} from "../services/auth-service.ts";
import auth from "../middlewares/auth-middleware.ts";
import validate from "../middlewares/validaton-middleware.ts";
import {
  loginSchema,
  meSchema,
  registerSchema,
} from "../validations/auth-schemas.ts";

export default (options?: RouterOptions) => {
  const router: Router = new Router(options);

  router.post("/login", validate(loginSchema), async (ctx: Context) => {
    await login(ctx);
    ctx.response.body = "Login successful";
  });

  router.post("/logout", async (ctx: Context) => {
    await logout(ctx);
    ctx.response.body = "Logout successful";
  });

  router.get("/me", auth, async (ctx: Context) => {
    const me = await getMe(ctx);
    ctx.response.body = me;
  });

  router.patch("/me", auth, validate(meSchema), async (ctx: Context) => {
    const me = await updateMe(ctx);
    ctx.response.body = me;
  });

  router.post(
    "/register",
    auth,
    validate(registerSchema),
    async (ctx: Context) => {
      await register(ctx);
      ctx.response.status = Status.Created;
    },
  );

  return router;
};
