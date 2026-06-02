import crypto from "crypto";

export const PRODUCT_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

interface UploadedProductImage {
  url: string;
  publicId: string;
}

function stripBrackets(s: string | undefined) {
  return s?.replace(/[<>]/g, "").trim() || undefined;
}

function getCloudinaryConfig() {
  let cloudName = stripBrackets(process.env.CLOUDINARY_CLOUD_NAME);
  let apiKey = stripBrackets(process.env.CLOUDINARY_API_KEY);
  let apiSecret = stripBrackets(process.env.CLOUDINARY_API_SECRET);

  // Fall back to the standard CLOUDINARY_URL (cloudinary://key:secret@cloud_name)
  if ((!cloudName || !apiKey || !apiSecret) && process.env.CLOUDINARY_URL) {
    const parsed = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
    if (parsed) {
      cloudName = cloudName || parsed.cloudName;
      apiKey = apiKey || parsed.apiKey;
      apiSecret = apiSecret || parsed.apiSecret;
    }
  }

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary storage is not configured");
  }

  return { cloudName, apiKey, apiSecret };
}

function parseCloudinaryUrl(url: string): { cloudName: string; apiKey: string; apiSecret: string } | null {
  // cloudinary://<api_key>:<api_secret>@<cloud_name>  (angle brackets are docs placeholders, strip them)
  const match = url.trim().match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!match) return null;
  const apiKey = match[1]?.replace(/[<>]/g, "").trim();
  const apiSecret = match[2]?.replace(/[<>]/g, "").trim();
  const cloudName = match[3]?.replace(/[<>]/g, "").trim();
  if (!apiKey || !apiSecret || !cloudName) return null;
  return { apiKey, apiSecret, cloudName };
}

export function isCloudinaryConfigured(): boolean {
  const hasParts = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
  if (hasParts) return true;
  return !!(process.env.CLOUDINARY_URL && parseCloudinaryUrl(process.env.CLOUDINARY_URL));
}

function signCloudinaryParams(params: Record<string, string | number>, apiSecret: string) {
  const payload = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

function isAllowedImageType(type: string): type is (typeof PRODUCT_IMAGE_MIME_TYPES)[number] {
  return PRODUCT_IMAGE_MIME_TYPES.includes(type as (typeof PRODUCT_IMAGE_MIME_TYPES)[number]);
}

export function validateProductImageFile(file: File) {
  if (!isAllowedImageType(file.type)) {
    return "Only JPG, JPEG, PNG, and WEBP images are allowed.";
  }

  if (file.size > PRODUCT_IMAGE_MAX_SIZE) {
    return "Each product image must be 5MB or smaller.";
  }

  return null;
}

export async function uploadProductImage(file: File): Promise<UploadedProductImage> {
  const validationError = validateProductImageFile(file);
  if (validationError) throw new Error(validationError);

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "watchstore/products";
  const signature = signCloudinaryParams({ folder, timestamp }, apiSecret);

  const body = new FormData();
  body.set("file", file);
  body.set("api_key", apiKey);
  body.set("timestamp", String(timestamp));
  body.set("folder", folder);
  body.set("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "Image upload failed.");
  }

  const result = await response.json() as { secure_url?: string; public_id?: string };
  if (!result.secure_url || !result.public_id) {
    throw new Error("Image upload did not return storage metadata.");
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteProductImage(publicId: string) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signCloudinaryParams({ public_id: publicId, timestamp }, apiSecret);

  const body = new FormData();
  body.set("public_id", publicId);
  body.set("api_key", apiKey);
  body.set("timestamp", String(timestamp));
  body.set("signature", signature);

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body,
  }).catch(() => null);
}
