"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { fetchBackend } from "@/lib/db";
import { z } from "zod";
import { FormInput } from "./FormComponents/FormInput";
import { FormTextarea } from "./FormComponents/FormTextarea";

export const profileFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  hobby1: z.string().optional(),
  hobby2: z.string().optional(),
  funQuestion1: z.string().optional(),
  funQuestion2: z.string().optional(),
  linkedIn: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || val.trim() === "" || z.string().url().safeParse(val).success,
      { message: "LinkedIn URL must be a valid URL" },
    ),
  profilePictureURL: z
    .string()
    .url("Profile picture URL must be a valid URL")
    .optional()
    .or(z.literal("")), // Allow empty strings
  additionalLink: z
    .string()
    .url("Additional link must be a valid URL")
    .optional()
    .or(z.literal("")), // Allow empty strings
  viewableMap: z.record(
    z.string(),
    z.boolean({
      required_error: "Viewable map values must be boolean",
    }),
  ),
});

interface ProfileFormSchema extends z.infer<typeof profileFormSchema> {}

interface NFCProfilePageProps {
  profileData: Partial<ProfileFormSchema>;
  error?: string;
  setProfileData: (data: any) => void;
  onFinishEdit?: () => void;
}

export const EditProfileForm: React.FC<NFCProfilePageProps> = ({
  profileData,
  error,
  setProfileData,
  onFinishEdit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormSchema>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      description: "",
      hobby1: "",
      hobby2: "",
      funQuestion1: "",
      funQuestion2: "",
      linkedIn: "",
      profilePictureURL: "",
      additionalLink: "",
      viewableMap: {},
      ...profileData,
    },
    mode: "onChange",
  });

  const handleSubmit = async (data: ProfileFormSchema) => {
    try {
      setIsSubmitting(true);
      const response = await fetchBackend({
        endpoint: "/profiles/user/",
        method: "PATCH",
        data: data,
        authenticatedCall: true,
      });

      if (response) {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
        setProfileData({ ...profileData, ...data });
        if (onFinishEdit) onFinishEdit();
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex text-white font-satoshi">
      <div className="flex-1 max-w-3xl mx-auto w-full px-4">
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8 bg-bt-blue-300/20 rounded-lg p-6 shadow-[inset_0_0_26.59px_rgba(255,255,255,0.1)] border-bt-blue-200 border"
        >
          <div className="space-y-6">
            <h3 className="font-semibold text-white">Edit Profile</h3>

            <Separator />
            <div className="min-h-[112px]">
              <FormTextarea
                name="description"
                label="Description"
                placeholder="Tell us about yourself..."
                control={form.control}
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormInput
                name="hobby1"
                label="Hobby 1"
                placeholder="Your first hobby"
                control={form.control}
                inputClassName="w-full truncate [&::placeholder]:text-sm"
              />

              <FormInput
                name="hobby2"
                label="Hobby 2"
                placeholder="Your second hobby"
                control={form.control}
                inputClassName="w-full truncate [&::placeholder]:text-sm"
              />

              <FormInput
                name="funQuestion1"
                label="Fun Question 1"
                placeholder="Share something fun about yourself"
                control={form.control}
                inputClassName="w-full truncate [&::placeholder]:text-sm"
              />

              <FormInput
                name="funQuestion2"
                label="Fun Question 2"
                placeholder="Another fun fact"
                control={form.control}
                inputClassName="w-full truncate [&::placeholder]:text-sm"
              />

              <FormInput
                name="linkedIn"
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/yourprofile"
                control={form.control}
                inputClassName="w-full truncate [&::placeholder]:text-sm"
              />

              <FormInput
                name="additionalLink"
                label="Additional Link"
                placeholder="https://yourwebsite.com"
                control={form.control}
                inputClassName="w-full truncate [&::placeholder]:text-sm"
              />

              <FormInput
                name="profilePictureURL"
                label="Profile Picture URL"
                placeholder="https://example.com/your-photo.jpg"
                control={form.control}
                inputClassName="w-full truncate [&::placeholder]:text-sm"
              />
            </div>

            <div className="space-y-6">
              <h4 className="font-semibold text-white mt-12">
                Privacy Settings
              </h4>
              <div className="space-y-3 border border-bt-blue-100 rounded-md p-4">
                <p className="text-sm text-white mb-4">
                  Choose what information is visible on your profile:
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {(
                    [
                      { key: "description", label: "Description" },
                      { key: "hobby1", label: "Hobby 1" },
                      { key: "hobby2", label: "Hobby 2" },
                      { key: "funQuestion1", label: "Fun Question 1" },
                      { key: "funQuestion2", label: "Fun Question 2" },
                      { key: "linkedIn", label: "LinkedIn" },
                      { key: "additionalLink", label: "Additional Link" },
                      { key: "profilePictureURL", label: "Profile Picture" },
                    ] as const
                  ).map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 min-w-0"
                    >
                      <label
                        className="text-sm text-bt-blue-0 truncate"
                        htmlFor={`viewableMap.${key}`}
                      >
                        {label}
                      </label>
                      <input
                        id={`viewableMap.${key}`}
                        type="checkbox"
                        {...form.register(`viewableMap.${key}` as const)}
                        checked={!!form.watch(`viewableMap.${key}` as const)}
                        className="rounded flex-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap sm:flex-nowrap">
              <Button variant="green" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
