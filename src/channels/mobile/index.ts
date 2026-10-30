import { Hono } from "hono";
import { userRoute } from "./user/user.route.js";
import { advertisementsRoute } from "./advertisements/advertisements.route.js";
import { inventoryRoute } from "./inventory/inventory.route.js";
import { notificationsRoute } from "./notifications/notifications.route.js";
import { recipesRoute } from "./recipes/recipes.route.js";
import { coreProxyRoute } from "./core/core-proxy.route.js";
import { commercialRoute } from "./commercial/commercial.route.js";
import { homeRoute } from "./home/home.route.js";
import { shoppingListRoute } from "./shopping-list/shopping-list.route.js";

const mobileApp = new Hono();

mobileApp.route("/home", homeRoute);
mobileApp.route("/user", userRoute);
mobileApp.route("/advertisements", advertisementsRoute);
mobileApp.route("/inventory", inventoryRoute);
mobileApp.route("/shopping-list", shoppingListRoute);
mobileApp.route("/notifications", notificationsRoute);
mobileApp.route("/recipes", recipesRoute);
mobileApp.route("/commercial", commercialRoute);
mobileApp.route("/core", coreProxyRoute);

export { mobileApp };
