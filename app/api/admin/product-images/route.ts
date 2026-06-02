import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { uploadProductImage, validateProductImageFile, isCloudinaryConfigured } from "@/lib/product-image-storage";

export async function POST(request: Request) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }

  const validationError = validateProductImageFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary storage is not configured. Add CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET) to your environment variables, or use 'Add by URL' to add images via link." },
      { status: 503 },
    );
  }

  try {
    const uploaded = await uploadProductImage(file);
    return NextResponse.json(uploaded);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
