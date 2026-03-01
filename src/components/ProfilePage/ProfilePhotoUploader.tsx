"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { fetchBackend } from "@/lib/db";
import imageCompression from "browser-image-compression";
import Image from "next/image";

type Props = {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  maxSizeMB?: number;
  profileId?: string;
};

const MAX_ORIGINAL_MB = 100;

export default function ProfilePhotoUploader({
  value,
  onChange,
  label = "Profile Photo",
  maxSizeMB = 50,
  profileId,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const previewBlobRef = useRef<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const clearPreview = () => {
    if (previewBlobRef.current && previewBlobRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(previewBlobRef.current);
    }
    previewBlobRef.current = null;
    setPreview(null);
  };

  useEffect(() => {
    return () => {
      if (previewBlobRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewBlobRef.current);
      }
    };
  }, []);

  const compressImage = (file: File) =>
    imageCompression(file, {
      maxSizeMB: 2.5,
      maxWidthOrHeight: 2048,
      initialQuality: 0.92,
      useWebWorker: true,
      fileType: "image/jpeg",
      maxIteration: 12,
    });

  const safeBase = (name: string) =>
    (name.split(".").slice(0, -1).join(".") || "photo").replace(/\.+$/, "");

  const presign = async (
    fileType: string,
    fileName: string,
    profileId?: string,
  ) => {
    const endpoint = profileId
      ? `/profiles/profile-pic-upload-url?profileId=${encodeURIComponent(profileId)}`
      : `/profiles/profile-pic-upload-url`;

    return fetchBackend({
      endpoint,
      method: "POST",
      data: { fileType, fileName },
    });
  };

  const handleFile = async (original: File) => {
    if (!original.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please choose an image.",
        variant: "destructive",
      });
      return;
    }

    if (original.size > MAX_ORIGINAL_MB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Max original size ${MAX_ORIGINAL_MB}MB.`,
        variant: "destructive",
      });
      return;
    }

    const localUrl = URL.createObjectURL(original);
    previewBlobRef.current = localUrl;
    setPreview(localUrl);
    setIsUploading(true);

    try {
      const compressed = await compressImage(original);
      const base = safeBase(original.name);

      const { uploadUrl: up1, publicUrl: optimizedUrl } = await fetchBackend({
        endpoint: profileId
          ? `/profiles/profile-pic-upload-url?profileId=${encodeURIComponent(profileId)}`
          : `/profiles/profile-pic-upload-url`,
        method: "POST",
        data: {
          fileType: compressed.type,
          fileName: `${base}-opt.jpg`,
          prefix: "optimized",
        },
      });
      if (!up1 || !optimizedUrl)
        throw new Error("Missing presign for optimized");

      const put1 = await fetch(up1, {
        method: "PUT",
        headers: { "Content-Type": compressed.type },
        body: compressed,
      });
      if (!put1.ok) throw new Error(`Optimized upload failed (${put1.status})`);

      (async () => {
        try {
          const { uploadUrl: up2 } = await fetchBackend({
            endpoint: profileId
              ? `/profiles/profile-pic-upload-url?profileId=${encodeURIComponent(profileId)}`
              : `/profiles/profile-pic-upload-url`,
            method: "POST",
            data: {
              fileType: original.type,
              fileName: original.name,
              prefix: "original",
            },
          });
          if (up2) {
            await fetch(up2, {
              method: "PUT",
              headers: { "Content-Type": original.type },
              body: original,
            });
          }
        } catch {
          // ignore failures for the archival original
        }
      })();

      onChange(optimizedUrl);
      clearPreview();
      toast({
        title: "Success",
        description: "Profile photo uploaded! Click Save to confirm.",
      });
    } catch (e: any) {
      console.error(e);
      clearPreview();
      toast({
        title: "Upload error",
        description: e?.message ?? "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm text-white">{label}</label>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={openPicker}
          className="relative h-20 w-20 rounded-full border border-white/20 overflow-hidden
                     shadow hover:ring-2 hover:ring-white/40 focus:outline-none focus:ring-2 focus:ring-white/60"
          aria-label="Change profile photo"
        >
          {preview || value ? (
            <Image
              src={preview || value!}
              alt="Profile picture"
              fill
              sizes="100vw"
              className={`object-cover ${isUploading ? "opacity-70" : ""}`}
            />
          ) : (
            <div className="h-full w-full grid place-content-center bg-white/5 text-xs text-white/60">
              Add Photo
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 grid place-content-center bg-black/40 text-white text-xs">
              Uploading…
            </div>
          )}
        </button>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={openPicker}
              disabled={isUploading}
            >
              {value ? "Change" : "Upload"}
            </Button>
            {value && !isUploading && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  clearPreview();
                  onChange("");
                  toast({
                    title: "Removed",
                    description:
                      "Profile photo removed. Click Save to confirm.",
                  });
                }}
              >
                Remove
              </Button>
            )}
          </div>
          <p className="text-[11px] text-white/50">
            PNG/JPG, up to {maxSizeMB}MB
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}
