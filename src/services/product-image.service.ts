import { createClient } from "@supabase/supabase-js";

const imageTypes = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
} as const;

export class ProductImageService {
  async createUpload(contentType: keyof typeof imageTypes) {
    const url = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET_PRODUCTS ?? process.env.SUPABASE_STORAGE_BUCKET ?? "products";
    if (!url || !secretKey) throw new Error("SUPABASE_URL e SUPABASE_SECRET_KEY precisam estar configurados no BFF.");

    const supabase = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const extension = imageTypes[contentType] ?? "jpg";
    const path = `products/${crypto.randomUUID()}.${extension}`;
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
    if (error) throw new Error(`Não foi possível preparar o upload da foto do produto: ${error.message}`);
    const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    return { path: data.path, token: data.token, uploadUrl: data.signedUrl, publicUrl };
  }
}

export const productImageService = new ProductImageService();
