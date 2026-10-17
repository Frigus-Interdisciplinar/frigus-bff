import { createClient } from "@supabase/supabase-js";

const bucketName = () => process.env.SUPABASE_CHAT_BUCKET ?? "chat-attachments";
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;

function storageClient() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) throw new Error("SUPABASE_URL e SUPABASE_SECRET_KEY precisam estar configurados no BFF.");
  return createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export class MessageAttachmentService {
  private bucketReady?: Promise<void>;

  private ensureBucket() {
    this.bucketReady ??= (async () => {
      const client = storageClient();
      const bucket = bucketName();
      const { error: getError } = await client.storage.getBucket(bucket);
      if (!getError) return;
      if (!getError.message.toLowerCase().includes("not found")) throw new Error(`Não foi possível verificar o bucket de anexos: ${getError.message}`);
      const { error: createError } = await client.storage.createBucket(bucket, {
        public: false,
        fileSizeLimit: "10MB",
        allowedMimeTypes: [...allowedMimeTypes],
      });
      if (createError && !createError.message.toLowerCase().includes("already exists")) {
        throw new Error(`Não foi possível criar o bucket privado de anexos: ${createError.message}`);
      }
    })();
    return this.bucketReady;
  }

  async createUpload(userId: string, conversationId: string, fileName: string, mimeType: string) {
    if (!allowedMimeTypes.includes(mimeType as typeof allowedMimeTypes[number])) throw new Error("Tipo de arquivo não permitido.");
    await this.ensureBucket();
    const extension = mimeType === "image/jpeg" ? "jpg" : mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "pdf";
    const path = `chat/${conversationId}/${userId}/${crypto.randomUUID()}.${extension}`;
    const { data, error } = await storageClient().storage.from(bucketName()).createSignedUploadUrl(path);
    if (error) throw new Error(`Não foi possível preparar o upload do anexo: ${error.message}`);
    return { bucket: bucketName(), path: data.path, token: data.token, fileName: fileName.slice(0, 255), mimeType };
  }

  async signMessageAttachments<T extends { attachments?: Array<{ fileUrl: string }> | null }>(message: T): Promise<T> {
    if (!message.attachments?.length) return message;
    const client = storageClient();
    const attachments = await Promise.all(message.attachments.map(async (file) => {
      const { data, error } = await client.storage.from(bucketName()).createSignedUrl(file.fileUrl, 60 * 60 * 24);
      if (error) throw new Error(`Não foi possível gerar um link para o anexo: ${error.message}`);
      return { ...file, fileUrl: data.signedUrl };
    }));
    return { ...message, attachments };
  }

  async signPage<T extends { content: Array<{ attachments?: Array<{ fileUrl: string }> | null }> }>(page: T): Promise<T> {
    return { ...page, content: await Promise.all(page.content.map((message) => this.signMessageAttachments(message))) };
  }
}

export const messageAttachmentService = new MessageAttachmentService();
