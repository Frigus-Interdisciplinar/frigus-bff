import { Hono } from "hono";
import { userRoute } from "./user/user.route.js";
import { advertisementsRoute } from "./advertisements/advertisements.route.js";

const mobileApp = new Hono();

mobileApp.route("/user", userRoute);
mobileApp.route("/advertisements", advertisementsRoute);

export { mobileApp };
