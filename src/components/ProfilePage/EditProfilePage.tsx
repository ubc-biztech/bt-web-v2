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
  LinkButton,
} from "@/components/ProfilePage/BizCardComponents";
import { GenericCardNFC } from "@/components/Common/Cards";
import { fetchBackend } from "@/lib/db";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { redirect, useRouter as useNavRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { FormTextarea } from "../Events/FormComponents/FormTextarea";
import { EditProfileForm } from "./EditProfileForm";
import Image from "next/image";
import { IconButton } from "../Common/IconButton";

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
  profileData: initialProfileData,
  error,
}: NFCProfilePageProps) => {
  const [profileData, setProfileData] = useState(initialProfileData);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const navRouter = useNavRouter();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
    shouldUnregister: false,
  });

  let route = router.asPath;
  let domain =
    typeof window !== "undefined"
      ? window.location.origin
      : "v2.ubcbiztech.com";

  const profileId = profileData.compositeID.split("#")[1];
  const fullURL = `${domain}/profile/${profileId}?scan=true`;

  if (!profileData) {
    return (
      <div className="flex flex-col items-center gap-4 w-full text-bt-blue-0 text-lg">
        Oops! No profile found.
        <IconButton
          variant="green"
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
    console.log("Submitting form...");

    setIsLoading(true);

    try {
      console.log("Attemping to update...");

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

  const UserExternalLinks = React.memo(() => (
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
  ));

  const VisibilityToggle = React.memo(
    ({ fieldKey, label }: { fieldKey: string; label: string }) => (
      <div className="flex items-center justify-between">
        <span className="text-sm text-bt-blue-0">{label}</span>
        <input
          type="checkbox"
          {...register(`viewableMap.${fieldKey}`)}
          className="rounded"
        />
      </div>
    ),
  );

  const EditableField = React.memo(
    ({
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
        <label className="text-sm font-medium text-bt-blue-0">
          {fieldName}
        </label>
        {type === "textarea" ? (
          <FormTextarea name="description" label="Description*" />
        ) : (
          <input
            {...register(registerName)}
            type={type}
            placeholder={placeholder}
            className="w-full p-2 rounded-md bg-bt-blue-300/20 border border-bt-blue-400 text-white placeholder-bt-blue-200"
          />
        )}
      </div>
    ),
  );

  UserExternalLinks.displayName = "UserExternalLinks";
  VisibilityToggle.displayName = "VisibilityToggle";
  EditableField.displayName = "EditableField";

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 text-white
                 py-4 gap-6 md:gap-8 space-y-6 md:space-y-0
                 max-w-6xl mx-auto"
    >
      <div className="flex flex-col justify-center items-center col-span-1 gap-4">
        <div className="place-items-center w-fit">
          <div className="w-32 h-32 bg-bt-blue-100 relative overflow-hidden rounded-full mx-auto mb-4 flex items-center justify-center">
            {profileData.profilePictureURL &&
            profileData.viewableMap.profilePictureURL ? (
              <Image
                src={profileData.profilePictureURL}
                alt="Profile Picture"
                fill
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <span className="text-3xl font-medium text-bt-blue-600">
                {fname[0].toUpperCase()}
                {lname[0].toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="text-center text-xl font-semibold mb-2">
            {fname} {lname}
          </h1>
          <p className="text-center text-bt-blue-0 mb-4">
            BizTech {profileType === "ATTENDEE" ? "Member" : "Exec"}
          </p>

          <div className="flex flex-wrap lg:flex-nowrap justify-center gap-2">
            <IconButton
              variant="outline"
              icon={Share}
              label="Share Profile"
              onClick={() => setDrawerOpen(true)}
            />

            <IconButton
              variant="outline"
              icon={isEditing ? X : Edit}
              label={isEditing ? "Cancel" : "Edit Profile"}
              onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
            />
          </div>
        </div>

        <div className="hidden lg:block">
          <UserExternalLinks />
        </div>
      </div>

      <div className="flex flex-col justify-center lg:col-span-2 space-y-6 w-full min-w-0">
        {isEditing ? (
          <EditProfileForm
            profileData={profileData}
            setProfileData={setProfileData}
            onFinishEdit={() => setIsEditing(false)}
          />
        ) : (
          <>
            {/* Display Mode - Original Profile View */}
            <GenericCardNFC title={`About ${fname}`} isCollapsible={false}>
              <div className="space-y-4">
                <p className="text-bt-blue-0 text-sm">
                  {description || "No description provided."}
                </p>

                {(hobby1 || hobby2) && (
                  <>
                    <div className="inline-flex flex-wrap items-center gap-2">
                      <span className="text-sm text-bt-blue-0">Hobbies:</span>
                      <div className="flex flex-wrap gap-2">
                        {hobby1 && profileData.viewableMap.hobby1 && (
                          <HobbyTag hobby={hobby1} />
                        )}
                        {hobby2 && profileData.viewableMap.hobby1 && (
                          <HobbyTag hobby={hobby2} />
                        )}
                      </div>
                    </div>
                    <div className="border-bt-blue-400 border-[0.5px]" />
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

            <div className="block lg:hidden">
              <UserExternalLinks />
            </div>

            {/* Q&A Section */}
            {(funQuestion1 || funQuestion2) && (
              <GenericCardNFC isCollapsible={false}>
                {questions.map((question, idx) => (
                  <div key={question} className="">
                    <span className="rounded-lg">
                      <p className="text-sm text-bt-blue-0 mb-2">{question}</p>
                    </span>

                    {questions.length > 1 && idx < questions.length - 1 && (
                      <div className="border-bt-blue-400 border-[0.5px]" />
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
