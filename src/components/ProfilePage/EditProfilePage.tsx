"use client";

import {
  Share,
  ExternalLink,
  Calendar,
  LinkIcon,
  IdCardLanyard,
  GraduationCap,
  Home,
  Edit,
  Save,
  X,
} from "lucide-react";
import ShareProfileDrawer from "@/components/ProfilePage/ShareProfileDrawer";
import {
  BiztechProfile,
  DisplayUserField,
  HobbyTag,
  IconButton,
  LinkButton,
} from "@/components/ProfilePage/BizCardComponents";
import { GenericCardNFC } from "@/components/Common/Cards";
import { fetchBackend } from "@/lib/db";
import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { redirect, useRouter as useNavRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";

interface NFCProfilePageProps {
  profileData: BiztechProfile;
  error?: string;
}

type ProfileFormFieldNames =
  | "hobby1"
  | "hobby2"
  | "funQuestion1"
  | "funQuestion2"
  | "linkedIn"
  | "profilePictureURL"
  | "additionalLink"
  | "description";

interface ProfileUpdateForm {
  viewableMap: {
    [key: string]: boolean;
  };
  hobby1?: string;
  hobby2?: string;
  funQuestion1?: string;
  funQuestion2?: string;
  linkedIn?: string;
  profilePictureURL?: string;
  additionalLink?: string;
  description?: string;
  [key: string]: unknown;
}

export const EditProfilePage = ({
  profileData,
  error,
}: NFCProfilePageProps) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const navRouter = useNavRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateForm>({
    defaultValues: {
      viewableMap: profileData?.viewableMap || {},
      hobby1: profileData?.hobby1 || "",
      hobby2: profileData?.hobby2 || "",
      funQuestion1: profileData?.funQuestion1 || "",
      funQuestion2: profileData?.funQuestion2 || "",
      linkedIn: profileData?.linkedIn || "",
      profilePictureURL: profileData?.profilePictureURL || "",
      additionalLink: profileData?.additionalLink || "",
      description: profileData?.description || "",
    },
  });

  let route = router.asPath;
  let domain =
    typeof window !== "undefined"
      ? window.location.origin
      : "v2.ubcbiztech.com";

  const fullURL = `${domain}/profile/`;

  if (!profileData) {
    return (
      <div className="flex flex-col items-center gap-4 w-full text-pale-blue text-lg">
        Oops! No profile found.
        <IconButton
          label="Return to home"
          onClick={() => navRouter.push("/")}
          className="w-fit"
          icon={Home}
        />
      </div>
    );
  }

  const {
    profileType,
    fname,
    lname,
    pronouns,
    year,
    major,
    hobby1,
    hobby2,
    funQuestion1,
    funQuestion2,
    linkedIn,
    profilePictureURL,
    additionalLink,
    description,
  } = profileData;

  const questions = [funQuestion1, funQuestion2];

  const onSubmit: SubmitHandler<ProfileUpdateForm> = async (data) => {
    console.log("onSubmit");

    setIsLoading(true);

    try {
      console.log("updating...");

      const response = await fetchBackend({
        endpoint: "/profiles/user/",
        method: "PATCH",
        data: data,
        authenticatedCall: true,
      });

      console.log(response);

      if (response) {
        router.reload();
        setIsEditing(false);
      }
    } catch (error) {
      console.log("error...");
      console.error("Error updating profile:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    reset(); // Reset form to original values
    setIsEditing(false);
  };

  const UserExternalLinks = () => (
    <div className="grid grid-cols-1 gap-4">
      {linkedIn && (
        <LinkButton linkIcon={ExternalLink} label="LinkedIn" url={linkedIn} />
      )}
      {additionalLink && (
        <LinkButton
          linkIcon={LinkIcon}
          label="Additional Link"
          url={additionalLink}
        />
      )}
    </div>
  );

  const EditableField = ({
    fieldName,
    registerName,
    placeholder,
    type = "text",
  }: {
    fieldName: string;
    registerName: ProfileFormFieldNames;
    placeholder: string;
    type?: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-pale-blue">{fieldName}</label>
      {type === "textarea" ? (
        <textarea
          {...register(registerName)}
          placeholder={placeholder}
          className="w-full p-2 rounded-md bg-biztech-navy border border-border-blue text-white placeholder-pale-blue resize-none"
          rows={3}
        />
      ) : (
        <input
          {...register(registerName)}
          type={type}
          placeholder={placeholder}
          className="w-full p-2 rounded-md bg-biztech-navy border border-border-blue text-white placeholder-pale-blue"
        />
      )}
    </div>
  );

  const VisibilityToggle = ({
    fieldKey,
    label,
  }: {
    fieldKey: string;
    label: string;
  }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-pale-blue">{label}</span>
      <input
        type="checkbox"
        {...register(`viewableMap.${fieldKey}`)}
        className="rounded"
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 text-white py-4 md:p-8 md:gap-8 space-y-6 md:space-y-0">
      <div className="flex flex-col justify-center items-center col-span-1 gap-4">
        <div className="place-items-center w-fit">
          <div className="w-32 h-32 bg-events-baby-blue rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl font-medium text-biztech-navy">FL</span>
          </div>
          <h1 className="text-center text-xl font-semibold mb-2">
            {fname} {lname}
          </h1>
          <p className="text-pale-blue mb-4">
            BizTech {profileType === "ATTENDEE" ? "Member" : "Exec"}
          </p>

          <div className="flex gap-2">
            <IconButton
              icon={Share}
              label="Share Profile"
              onClick={() => setDrawerOpen(true)}
            />

            <IconButton
              icon={isEditing ? X : Edit}
              label={isEditing ? "Cancel" : "Edit Profile"}
              onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
            />
          </div>
        </div>

        <div className="hidden md:block">
          <UserExternalLinks />
        </div>
      </div>

      <div className="flex flex-col justify-center col-span-2 space-y-6 w-full">
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Edit Form */}
            <GenericCardNFC title="Edit Profile" isCollapsible={false}>
              <div className="space-y-4">
                <EditableField
                  fieldName="Description"
                  registerName="description"
                  placeholder="Tell us about yourself..."
                  type="textarea"
                />

                <EditableField
                  fieldName="Hobby 1"
                  registerName="hobby1"
                  placeholder="Your first hobby"
                />

                <EditableField
                  fieldName="Hobby 2"
                  registerName="hobby2"
                  placeholder="Your second hobby"
                />

                <EditableField
                  fieldName="Fun Question 1"
                  registerName="funQuestion1"
                  placeholder="Share something fun about yourself"
                />

                <EditableField
                  fieldName="Fun Question 2"
                  registerName="funQuestion2"
                  placeholder="Another fun fact"
                />

                <EditableField
                  fieldName="LinkedIn URL"
                  registerName="linkedIn"
                  placeholder="https://linkedin.com/in/yourprofile"
                  type="url"
                />

                <EditableField
                  fieldName="Additional Link"
                  registerName="additionalLink"
                  placeholder="https://yourwebsite.com"
                  type="url"
                />

                <EditableField
                  fieldName="Profile Picture URL"
                  registerName="profilePictureURL"
                  placeholder="https://example.com/your-photo.jpg"
                  type="url"
                />
              </div>
            </GenericCardNFC>

            {/* Visibility Settings */}
            <GenericCardNFC title="Privacy Settings" isCollapsible={false}>
              <div className="space-y-3">
                <p className="text-sm text-pale-blue mb-4">
                  Choose what information is visible on your profile:
                </p>
                <VisibilityToggle fieldKey="description" label="Description" />
                <VisibilityToggle fieldKey="hobby1" label="Hobby 1" />
                <VisibilityToggle fieldKey="hobby2" label="Hobby 2" />
                <VisibilityToggle
                  fieldKey="funQuestion1"
                  label="Fun Question 1"
                />
                <VisibilityToggle
                  fieldKey="funQuestion2"
                  label="Fun Question 2"
                />
                <VisibilityToggle fieldKey="linkedIn" label="LinkedIn" />
                <VisibilityToggle
                  fieldKey="additionalLink"
                  label="Additional Link"
                />
                <VisibilityToggle
                  fieldKey="profilePictureURL"
                  label="Profile Picture"
                />
              </div>
            </GenericCardNFC>

            {/* Save/Cancel Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                onClick={handleCancelEdit}
                disabled={isLoading}
                className="bg-white text-biztech-navy hover:bg-white/80"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !isDirty}
                className="flex items-center gap-2 bg-biztech-green text-biztech-navy hover:bg-[#40ba1e]"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        ) : (
          <>
            {/* Display Mode - Original Profile View */}
            <GenericCardNFC title={`About ${fname}`} isCollapsible={false}>
              <div className="space-y-4">
                <p className="text-pale-blue text-sm">
                  {description || "No description provided."}
                </p>

                {(hobby1 || hobby2) && (
                  <>
                    <div className="inline-flex flex-wrap items-center gap-2">
                      <span className="text-sm text-pale-blue">Hobbies:</span>
                      <div className="flex flex-wrap gap-2">
                        {hobby1 && <HobbyTag hobby={hobby1} />}
                        {hobby2 && <HobbyTag hobby={hobby2} />}
                      </div>
                    </div>
                    <div className="border-border-blue border-[0.5px]" />
                  </>
                )}

                <div className="space-y-3">
                  <DisplayUserField
                    icon={IdCardLanyard}
                    fieldName="Pronouns"
                    fieldValue={pronouns}
                  />
                  <DisplayUserField
                    icon={GraduationCap}
                    fieldName="Major"
                    fieldValue={major}
                  />
                  <DisplayUserField
                    icon={Calendar}
                    fieldName="Year"
                    fieldValue={year}
                  />
                </div>
              </div>
            </GenericCardNFC>

            <div className="block md:hidden">
              <UserExternalLinks />
            </div>

            {/* Q&A Section */}
            {(funQuestion1 || funQuestion2) && (
              <GenericCardNFC isCollapsible={false}>
                {questions.map((question, idx) => (
                  <div key={idx} className="">
                    <span className="rounded-lg">
                      <p className="text-sm text-pale-blue mb-2">{question}</p>
                    </span>

                    {questions.length > 1 && idx < questions.length - 1 && (
                      <div className="border-border-blue border-[0.5px]" />
                    )}
                  </div>
                ))}
              </GenericCardNFC>
            )}
          </>
        )}
      </div>

      <ShareProfileDrawer
        isOpen={isDrawerOpen}
        setIsOpen={setDrawerOpen}
        url={fullURL}
      />
    </div>
  );
};
