import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware } from "../../../middlewares/index.js";
import { profileService } from "../../../services/index.js";
import { issueShoppingFirebaseToken } from "../../../services/firebase-shopping-session.service.js";

type ProfileReader = (headers: { Authorization: string }) => Promise<{ id: string }>;
type TokenIssuer = typeof issueShoppingFirebaseToken;

export function createFirebaseRoute(
  readProfile: ProfileReader = (headers) => profileService.getProfile({ headers }),
  issueToken: TokenIssuer = issueShoppingFirebaseToken,
) {
  const route = new Hono();
  route.use("*", authMiddleware);
  route.post("/session", async (c) => {
    c.header("Cache-Control", "no-store");
    // Validate the Core session every time, before minting any Firebase credential.
    const profile = await readProfile(c.get("authHeaders"));
    const owner = z.string().uuid().safeParse(profile.id);
    if (!owner.success) return c.json({ status: 502, code: "INVALID_RESPONSE",
      displayMessage: "Não foi possível confirmar a conta para sincronizar a lista." }, 502);
    try {
      const session = await issueToken(owner.data);
      if (session.uid !== owner.data || !session.projectId || !session.customToken) throw new Error("Invalid Firebase session");
      return c.json(session);
    } catch {
      return c.json({ status: 503, code: "FIREBASE_UNAVAILABLE",
        displayMessage: "A sincronização com o Firebase está indisponível. Sua lista continua salva no aparelho." }, 503);
    }
  });
  return route;
}

export const firebaseRoute = createFirebaseRoute();
