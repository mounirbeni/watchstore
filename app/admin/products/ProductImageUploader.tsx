"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface ProductImageUploadValue {
  id?: string;
  url: string;
  publicId?: string | null;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface UploadItem extends ProductImageUploadValue {
  localId: string;
  progress: number;
  uploading: boolean;
  error?: string;
}

interface ProductImageUploaderProps {
  initialImages?: ProductImageUploadValue[];
  inputName?: string;
  cloudinaryConfigured?: boolean;
}

function normalizeImages(images: ProductImageUploadValue[]): UploadItem[] {
  return images.map((image, index) => ({
    ...image,
    localId: image.id ?? image.publicId ?? `${image.url}-${index}`,
    isPrimary: image.isPrimary || index === 0,
    sortOrder: index,
    progress: 100,
    uploading: false,
  }));
}

function validateFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) return "Only JPG, JPEG, PNG, and WEBP images are allowed.";
  if (file.size > MAX_FILE_SIZE) return "Each image must be 5MB or smaller.";
  return null;
}

function uploadFile(file: File, onProgress: (progress: number) => void) {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const formData = new FormData();
    formData.set("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/product-images");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText || "{}") as { url?: string; publicId?: string; error?: string };
        if (xhr.status >= 200 && xhr.status < 300 && payload.url && payload.publicId) {
          resolve({ url: payload.url, publicId: payload.publicId });
          return;
        }
        reject(new Error(payload.error ?? "Image upload failed."));
      } catch {
        reject(new Error("Image upload failed."));
      }
    };

    xhr.onerror = () => reject(new Error("Image upload failed."));
    xhr.send(formData);
  });
}

function isValidUrl(str: string) {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ProductImageUploader({
  initialImages = [],
  inputName = "productImages",
  cloudinaryConfigured = true,
}: ProductImageUploaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadItem[]>(() => normalizeImages(initialImages));
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const hasUploadsInProgress = images.some((image) => image.uploading);
  const validImages = images.filter((image) => image.url && !image.uploading && !image.error);

  const serializedImages = useMemo(() => {
    return JSON.stringify(
      validImages.map((image, index) => ({
        id: image.id,
        url: image.url,
        publicId: image.publicId ?? null,
        altText: image.altText ?? null,
        isPrimary: image.isPrimary,
        sortOrder: index,
      })),
    );
  }, [validImages]);

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;

    const handleSubmit = (event: SubmitEvent) => {
      if (hasUploadsInProgress) {
        event.preventDefault();
        setError("Wait for all image uploads to finish before saving.");
      }
      // Images are optional — no hard block if none uploaded
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, [hasUploadsInProgress]);

  const addFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setError(null);

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const localId = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      setImages((current) => [
        ...current,
        {
          localId,
          url: previewUrl,
          publicId: null,
          altText: file.name.replace(/\.[^.]+$/, ""),
          isPrimary: current.length === 0,
          sortOrder: current.length,
          progress: 0,
          uploading: true,
        },
      ]);

      try {
        const uploaded = await uploadFile(file, (progress) => {
          setImages((current) => current.map((image) => (
            image.localId === localId ? { ...image, progress } : image
          )));
        });

        URL.revokeObjectURL(previewUrl);
        setImages((current) => current.map((image) => (
          image.localId === localId
            ? { ...image, url: uploaded.url, publicId: uploaded.publicId, progress: 100, uploading: false }
            : image
        )));
      } catch (uploadError) {
        URL.revokeObjectURL(previewUrl);
        setImages((current) => current.map((image) => (
          image.localId === localId
            ? {
                ...image,
                url: "",
                uploading: false,
                error: uploadError instanceof Error ? uploadError.message : "Image upload failed.",
              }
            : image
        )));
      }
    }
  };

  const addByUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!isValidUrl(trimmed)) {
      setError("Please enter a valid https:// image URL.");
      return;
    }
    setError(null);
    const localId = `url-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setImages((current) => [
      ...current,
      {
        localId,
        url: trimmed,
        publicId: null,
        altText: null,
        isPrimary: current.filter((i) => !i.error).length === 0,
        sortOrder: current.length,
        progress: 100,
        uploading: false,
      },
    ]);
    setUrlInput("");
    setShowUrlInput(false);
  };

  const removeImage = (localId: string) => {
    setImages((current) => {
      const next = current.filter((image) => image.localId !== localId);
      if (next.length > 0 && !next.some((image) => image.isPrimary)) {
        const first = next[0];
        if (first) next[0] = { ...first, isPrimary: true };
      }
      return next.map((image, index) => ({ ...image, sortOrder: index }));
    });
  };

  const setPrimary = (localId: string) => {
    setImages((current) => current.map((image) => ({ ...image, isPrimary: image.localId === localId })));
  };

  const moveImage = (localId: string, direction: -1 | 1) => {
    setImages((current) => {
      const index = current.findIndex((image) => image.localId === localId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;

      const next = [...current];
      const [item] = next.splice(index, 1);
      if (!item) return current;
      next.splice(target, 0, item);
      return next.map((image, sortOrder) => ({ ...image, sortOrder }));
    });
  };

  return (
    <section ref={rootRef} className="space-y-4">
      <input type="hidden" name={inputName} value={serializedImages} />
      <div>
        <h2 className="text-lg font-serif text-white">Product images</h2>
        <p className="mt-1 text-sm text-luxury-muted">
          Upload main, gallery, and detail images. JPG, PNG, and WEBP only. Maximum 5MB per image.
        </p>
      </div>

      {!cloudinaryConfigured && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <p className="font-semibold text-amber-300">Cloudinary not configured</p>
          <p className="mt-1 text-amber-200/80">
            File uploads are disabled. Add <code className="rounded bg-black/30 px-1">CLOUDINARY_CLOUD_NAME</code>,{" "}
            <code className="rounded bg-black/30 px-1">CLOUDINARY_API_KEY</code>, and{" "}
            <code className="rounded bg-black/30 px-1">CLOUDINARY_API_SECRET</code> to your Vercel environment variables.
            In the meantime, use <strong>Add by URL</strong> below to add images via a direct link.
          </p>
        </div>
      )}

      {cloudinaryConfigured && (
        <div
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void addFiles(event.dataTransfer.files);
          }}
          className={`rounded-2xl border border-dashed p-6 text-center transition ${
            dragging ? "border-gold-500 bg-gold-500/10" : "border-luxury-border bg-luxury-dark/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) void addFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />
          <p className="text-sm font-medium text-white">Drag images here or select files from your device.</p>
          <p className="mt-1 text-xs text-luxury-muted">Recommended ratio: 1:1 or 4:5.</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-4 rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gold-400"
          >
            Select images
          </button>
        </div>
      )}

      <div className="space-y-2">
        {!showUrlInput ? (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="rounded-xl border border-luxury-border px-4 py-2 text-sm font-medium text-luxury-muted transition hover:text-white"
          >
            + Add by URL
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addByUrl(); } }}
              placeholder="https://example.com/image.jpg"
              className="input-luxury flex-1"
              autoFocus
            />
            <button
              type="button"
              onClick={addByUrl}
              className="rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-gold-400"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setShowUrlInput(false); setUrlInput(""); }}
              className="rounded-xl border border-luxury-border px-4 py-2 text-sm font-medium text-luxury-muted transition hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {error && <p className="rounded-xl border border-gold-500/40 bg-gold-500/10 p-3 text-sm text-gold-300">{error}</p>}

      {images.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {images.filter((image) => !image.error || image.uploading).map((image, index) => (
            <article key={image.localId} className="overflow-hidden rounded-2xl border border-luxury-border bg-luxury-dark/40">
              <div className="relative aspect-square bg-luxury-dark">
                {image.url && (
                  // eslint-disable-next-line @next/next/no-img-element -- Admin previews include local object URLs and external URLs.
                  <img src={image.url} alt={image.altText ?? "Product image"} className="h-full w-full object-cover" />
                )}
                {image.isPrimary && (
                  <span className="absolute left-3 top-3 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-black">
                    Primary
                  </span>
                )}
                {image.uploading && (
                  <div className="absolute inset-x-0 bottom-0 bg-luxury-black/80 p-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-luxury-border">
                      <div className="h-full rounded-full bg-gold-500" style={{ width: `${image.progress}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-luxury-light">Uploading {image.progress}%</p>
                  </div>
                )}
              </div>
              <div className="space-y-3 p-4">
                <input
                  value={image.altText ?? ""}
                  placeholder="Alt text"
                  className="input-luxury w-full"
                  onChange={(event) => {
                    const altText = event.target.value;
                    setImages((current) => current.map((item) => (
                      item.localId === image.localId ? { ...item, altText } : item
                    )));
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPrimary(image.localId)}
                    disabled={image.isPrimary || image.uploading}
                    className="rounded-lg border border-gold-500/40 px-3 py-2 text-xs font-semibold text-gold-400 transition hover:bg-gold-500/10 disabled:opacity-40"
                  >
                    Make primary
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(image.localId, -1)}
                    disabled={index === 0 || image.uploading}
                    className="rounded-lg border border-luxury-border px-3 py-2 text-xs font-semibold text-luxury-muted transition hover:text-white disabled:opacity-40"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(image.localId, 1)}
                    disabled={index === images.filter((i) => !i.error || i.uploading).length - 1 || image.uploading}
                    className="rounded-lg border border-luxury-border px-3 py-2 text-xs font-semibold text-luxury-muted transition hover:text-white disabled:opacity-40"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(image.localId)}
                    className="rounded-lg border border-luxury-border px-3 py-2 text-xs font-semibold text-luxury-muted transition hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
