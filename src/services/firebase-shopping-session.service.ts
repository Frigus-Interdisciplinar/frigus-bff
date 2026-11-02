import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/** Only server credentials sign tokens. No Core token or password is sent to Firebase. */
export async function issueShoppingFirebaseToken(uid: string): Promise<{ uid: string; projectId: string; customToken: string }> {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId) throw new Error("Firebase is not configured");
  let app = getApps().find((candidate) => candidate.name === "frigus-shopping");
  if (!app) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const adcConfigured = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE ||
      process.env.FUNCTION_TARGET || process.env.GCE_METADATA_HOST;
    if (!serviceAccount && !adcConfigured) throw new Error("Firebase signing credentials are not configured");
    let credential;
    if (serviceAccount) {
      const account = JSON.parse(serviceAccount) as Record<string, string>;
      if (account.project_id !== projectId || !account.client_email || !account.private_key)
        throw new Error("Firebase project or signing credentials mismatch");
      credential = cert({ projectId, clientEmail: account.client_email, privateKey: account.private_key });
    } else credential = applicationDefault();
    app = initializeApp({ projectId, credential }, "frigus-shopping");
  }
  if (app.options.projectId !== projectId) throw new Error("Firebase project mismatch");
  const customToken = await getAuth(app).createCustomToken(uid);
  return { uid, projectId, customToken };
}
