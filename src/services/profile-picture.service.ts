import { createClient } from "@supabase/supabase-js";
import type { UserResponse } from "../types/index.js";

const imageTypes = {
  "image/png": "png",
  "image/jpeg": "jpg",
} as const;

export class ProfilePictureService {
  async resolveProfilePictureUrl(profilePictureUrl?: string | null) {
    if (!profilePictureUrl) return profilePictureUrl;

    const url = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "profile-picture";
    if (!url || !secretKey) return profilePictureUrl;

    const storedUrl = new URL(profilePictureUrl);
    const publicPrefix = `/storage/v1/object/public/${bucket}/`;
    const signedPrefix = `/storage/v1/object/sign/${bucket}/`;
    const prefix = storedUrl.pathname.startsWith(publicPrefix)
      ? publicPrefix
      : storedUrl.pathname.startsWith(signedPrefix)
        ? signedPrefix
        : undefined;
    if (!prefix || new URL(url).host !== storedUrl.host) return profilePictureUrl;

    const path = storedUrl.pathname
      .slice(prefix.length)
      .split("/")
      .map((segment) => decodeURIComponent(segment))
      .join("/");
    const supabase = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60);
    if (error) throw new Error(`Não foi possível carregar a foto de perfil: ${error.message}`);
    return data.signedUrl;
  }

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
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return {
      path: data.path,
      token: data.token,
      uploadUrl: data.signedUrl,
      profilePictureUrl: publicUrlData.publicUrl,
    };
  }
}

export const profilePictureService = new ProfilePictureService();
