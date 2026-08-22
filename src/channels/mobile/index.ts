import { Hono } from "hono";
import { userRoute } from "./user/user.route.js";

const mobileApp = new Hono();

mobileApp.route("/user", userRoute);

export { mobileApp };
