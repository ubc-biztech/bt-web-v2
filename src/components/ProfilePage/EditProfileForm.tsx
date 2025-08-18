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
  linkedIn: z.string().url("LinkedIn URL must be a valid URL").optional(),
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
}

export const EditProfileForm: React.FC<NFCProfilePageProps> = ({
  profileData,
  error,
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
        form.reset(data);
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
          className="space-y-8 bg-biztech-navy/80 rounded-lg p-6 shadow-[inset_0_0_26.59px_rgba(255,255,255,0.1)] border-border-blue border"
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

            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-biztech-green hover:bg-biztech-green/80 text-dark-navy"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
