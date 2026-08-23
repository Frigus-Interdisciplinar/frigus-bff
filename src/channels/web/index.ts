import { Hono } from "hono";
import { authRoute } from "./auth/auth.route.js";
import { profileRoute } from "./profile/profile.route.js";
import { transactionRoute } from "./transaction/transaction.route.js";
import { userRoute } from "./user/user.route.js";

const webApp = new Hono();

webApp.route("/auth", authRoute);
webApp.route("/profile", profileRoute);
webApp.route("/transactions", transactionRoute);
webApp.route("/user", userRoute);

export { webApp };
