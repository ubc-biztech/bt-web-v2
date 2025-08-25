"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { fetchBackend } from "@/lib/db";

type Props = {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  maxSizeMB?: number;
  profileId?: string;
};

const PRESIGN_ENDPOINT = "/profiles/profile-pic-upload-url";

export default function ProfilePhotoUploader({
  value,
  onChange,
  label = "Profile Photo",
  maxSizeMB = 5,
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

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please choose an image.",
        variant: "destructive",
      });
      return;
    }
    const maxBytes = (maxSizeMB ?? 5) * 1024 * 1024;
    if (file.size > maxBytes) {
      toast({
        title: "File too large",
        description: `Max ${maxSizeMB}MB.`,
        variant: "destructive",
      });
      return;
    }

    const localUrl = URL.createObjectURL(file);
    previewBlobRef.current = localUrl;
    setPreview(localUrl);
    setIsUploading(true);

    try {
      const endpoint = profileId
        ? `${PRESIGN_ENDPOINT}?profileId=${encodeURIComponent(profileId)}`
        : PRESIGN_ENDPOINT;

      const { uploadUrl, publicUrl } = await fetchBackend({
        endpoint,
        method: "POST",
        data: { fileType: file.type, fileName: file.name },
        authenticatedCall: true,
      });
      if (!uploadUrl || !publicUrl)
        throw new Error("Missing uploadUrl/publicUrl");

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);

      onChange(publicUrl);
      clearPreview();

      toast({ title: "Uploaded", description: "Profile photo updated." });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Upload error",
        description: e?.message ?? "Something went wrong",
        variant: "destructive",
      });

      clearPreview();
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview || value!}
              alt="Profile picture"
              className={`h-full w-full object-cover ${isUploading ? "opacity-70" : ""}`}
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
