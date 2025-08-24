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
      <div className="flex-1">
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8 bg-bt-blue-300/20 rounded-lg p-6 shadow-[inset_0_0_26.59px_rgba(255,255,255,0.1)] border-bt-blue-200 border"
        >
          <div className="space-y-6">
            <h3 className="font-semibold text-white">Edit Profile</h3>

            <Separator />

            <FormTextarea
              name="description"
              label="Description"
              placeholder="Tell us about yourself..."
              control={form.control}
              required
            />

            <FormInput
              name="hobby1"
              label="Hobby 1"
              placeholder="Your first hobby"
              control={form.control}
            />

            <FormInput
              name="hobby2"
              label="Hobby 2"
              placeholder="Your second hobby"
              control={form.control}
            />

            <FormInput
              name="funQuestion1"
              label="Fun Question 1"
              placeholder="Share something fun about yourself"
              control={form.control}
            />

            <FormInput
              name="funQuestion2"
              label="Fun Question 2"
              placeholder="Another fun fact"
              control={form.control}
            />

            <FormInput
              name="linkedIn"
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/yourprofile"
              control={form.control}
            />

            <FormInput
              name="additionalLink"
              label="Additional Link"
              placeholder="https://yourwebsite.com"
              control={form.control}
            />

            <FormInput
              name="profilePictureURL"
              label="Profile Picture URL"
              placeholder="https://example.com/your-photo.jpg"
              control={form.control}
            />

            <div className="space-y-6 ">
              <h4 className="font-semibold text-white mt-12">
                Privacy Settings
              </h4>
              <div className="space-y-3 border border-bt-blue-100 rounded-md p-4">
                <p className="text-sm text-white mb-4">
                  Choose what information is visible on your profile:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between w-[90%]">
                    <label
                      className="text-sm text-bt-blue-0"
                      htmlFor="viewableMap.description"
                    >
                      Description
                    </label>
                    <input
                      id="viewableMap.description"
                      type="checkbox"
                      {...form.register("viewableMap.description")}
                      checked={!!form.watch("viewableMap.description")}
                      className="ml-2 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between w-[90%]">
                    <label
                      className="text-sm text-bt-blue-0"
                      htmlFor="viewableMap.hobby1"
                    >
                      Hobby 1
                    </label>
                    <input
                      id="viewableMap.hobby1"
                      type="checkbox"
                      {...form.register("viewableMap.hobby1")}
                      checked={!!form.watch("viewableMap.hobby1")}
                      className="ml-2 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between w-[90%]">
                    <label
                      className="text-sm text-bt-blue-0"
                      htmlFor="viewableMap.hobby2"
                    >
                      Hobby 2
                    </label>
                    <input
                      id="viewableMap.hobby2"
                      type="checkbox"
                      {...form.register("viewableMap.hobby2")}
                      checked={!!form.watch("viewableMap.hobby2")}
                      className="ml-2 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between w-[90%]">
                    <label
                      className="text-sm text-bt-blue-0"
                      htmlFor="viewableMap.funQuestion1"
                    >
                      Fun Question 1
                    </label>
                    <input
                      id="viewableMap.funQuestion1"
                      type="checkbox"
                      {...form.register("viewableMap.funQuestion1")}
                      checked={!!form.watch("viewableMap.funQuestion1")}
                      className="ml-2 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between w-[90%]">
                    <label
                      className="text-sm text-bt-blue-0"
                      htmlFor="viewableMap.funQuestion2"
                    >
                      Fun Question 2
                    </label>
                    <input
                      id="viewableMap.funQuestion2"
                      type="checkbox"
                      {...form.register("viewableMap.funQuestion2")}
                      checked={!!form.watch("viewableMap.funQuestion2")}
                      className="ml-2 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between w-[90%]">
                    <label
                      className="text-sm text-bt-blue-0"
                      htmlFor="viewableMap.linkedIn"
                    >
                      LinkedIn
                    </label>
                    <input
                      id="viewableMap.linkedIn"
                      type="checkbox"
                      {...form.register("viewableMap.linkedIn")}
                      checked={!!form.watch("viewableMap.linkedIn")}
                      className="ml-2 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between w-[90%]">
                    <label
                      className="text-sm text-bt-blue-0"
                      htmlFor="viewableMap.additionalLink"
                    >
                      Additional Link
                    </label>
                    <input
                      id="viewableMap.additionalLink"
                      type="checkbox"
                      {...form.register("viewableMap.additionalLink")}
                      checked={!!form.watch("viewableMap.additionalLink")}
                      className="ml-2 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between w-[90%]">
                    <label
                      className="text-sm text-bt-blue-0"
                      htmlFor="viewableMap.profilePictureURL"
                    >
                      Profile Picture
                    </label>
                    <input
                      id="viewableMap.profilePictureURL"
                      type="checkbox"
                      {...form.register("viewableMap.profilePictureURL")}
                      checked={!!form.watch("viewableMap.profilePictureURL")}
                      className="ml-2 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
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
