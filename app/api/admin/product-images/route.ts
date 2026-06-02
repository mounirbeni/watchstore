import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { uploadProductImage, validateProductImageFile } from "@/lib/product-image-storage";

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

  try {
    const uploaded = await uploadProductImage(file);
    return NextResponse.json(uploaded);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
