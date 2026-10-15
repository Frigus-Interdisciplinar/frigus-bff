import { createClient } from "@supabase/supabase-js";
import type { UserResponse } from "../types/index.js";

const imageTypes = {
  "image/png": "png",
  "image/jpeg": "jpg",
} as const;

export class ProfilePictureService {
  async createUpload(user: UserResponse, contentType: keyof typeof imageTypes) {
    const url = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "profile-picture";
    if (!url || !secretKey) throw new Error("SUPABASE_URL e SUPABASE_SECRET_KEY precisam estar configurados no BFF.");

    const supabase = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const path = `${user.accountType.toLowerCase()}/${user.id}/${crypto.randomUUID()}.${imageTypes[contentType]}`;
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
    if (error) throw new Error(`Não foi possível preparar o upload da foto: ${error.message}`);
    return { path: data.path, token: data.token };
  }
}

export const profilePictureService = new ProfilePictureService();
