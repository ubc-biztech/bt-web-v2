import { useState, useEffect } from "react";
import {
  Loader2,
  XCircle,
  ArrowLeft,
  Linkedin,
  ExternalLink,
  Edit,
  X,
  Save,
} from "lucide-react";
import {
  Building2,
  GraduationCap,
  Briefcase,
  Calendar,
  Sparkles,
} from "lucide-react";
import BluePrintLayout from "../layout/BluePrintLayout";
import BluePrintCard from "../components/BluePrintCard";
import BluePrintButton from "../components/BluePrintButton";
import { fetchBackend } from "@/lib/db";
import { UserProfile, BackendProfile } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useUserProfile, getProfileId } from "@/queries/userProfile";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { DynamicPageProps } from "@/constants/companion-events";
import { useQueryClient } from "@tanstack/react-query";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function BluePrintProfile2026(
  props: DynamicPageProps & { profileId?: string },
) {
  const profileId = props.params?.profileId ?? props.profileId;
  const { eventId, year } = props;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { data: currentUserProfile } = useUserProfile();
  const currentUserProfileId = currentUserProfile?.compositeID
    ? getProfileId(currentUserProfile.compositeID)
    : null;
  const isOwnProfile =
    currentUserProfileId?.toLowerCase() === profileId?.toLowerCase();

  useEffect(() => {
    if (!profileId) {
      setIsLoading(false);
      setError("Invalid profile URL");
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchBackend({
          endpoint: `/profiles/profile/${profileId}`,
          method: "GET",
          authenticatedCall: false,
        });

        const backendProfile = response as BackendProfile;

        const transformedProfile: UserProfile = {
          profileID: backendProfile.profileID,
          fname: backendProfile.fname,
          lname: backendProfile.lname,
          pronouns: backendProfile.pronouns,
          type: backendProfile.type as "Partner" | "Attendee",
          hobby1: backendProfile.hobby1,
          hobby2: backendProfile.hobby2,
          funQuestion1: backendProfile.funQuestion1,
          funQuestion2: backendProfile.funQuestion2,
          linkedIn: backendProfile.linkedIn,
          profilePictureURL: backendProfile.profilePictureURL,
          additionalLink: backendProfile.additionalLink,
          description: backendProfile.description,
          major: backendProfile.major,
          year: backendProfile.year,
          eventIDYear: backendProfile.eventIDYear,
          role: backendProfile.role,
          createdAt: backendProfile.createdAt,
          updatedAt: backendProfile.updatedAt,
          company: backendProfile.company,
          companyProfileID: backendProfile.companyProfileID,
          companyProfilePictureURL: backendProfile.companyProfilePictureURL,
          viewableMap: backendProfile.viewableMap,
        };

        setProfile(transformedProfile);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        let errorMessage = "Failed to load profile";
        if (typeof err?.message === "string") {
          errorMessage = err.message;
        } else if (typeof err?.message?.message === "string") {
          errorMessage = err.message.message;
        } else if (err?.status === 404) {
          errorMessage = "Profile not found";
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  if (isLoading) {
    return (
      <BluePrintLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-white" size={48} />
        </div>
      </BluePrintLayout>
    );
  }

  if (error || !profile) {
    return (
      <BluePrintLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
          <XCircle size={64} className="text-red-400" />
          <div>
            <h1 className="text-2xl font-medium text-white mb-2">
              Profile Not Found
            </h1>
            <p className="text-[#778191]">
              {error || "Could not load profile"}
            </p>
          </div>
          <Link href={`/events/${eventId}/${year}/companion`}>
            <BluePrintButton>
              <ArrowLeft size={18} />
              Back to Home
            </BluePrintButton>
          </Link>
        </div>
      </BluePrintLayout>
    );
  }

  if (isEditing && profile) {
    return (
      <BluePrintLayout>
        <BluePrintEditProfile
          profile={profile}
          onCancel={() => setIsEditing(false)}
          onSave={(updatedProfile) => {
            setProfile(updatedProfile);
            setIsEditing(false);
          }}
          eventId={eventId}
          year={year}
          currentUserProfile={
            currentUserProfile
              ? {
                  viewableMap: currentUserProfile.viewableMap,
                  profilePictureURL: currentUserProfile.profilePictureURL,
                }
              : null
          }
        />
      </BluePrintLayout>
    );
  }

  return (
    <BluePrintLayout>
      {/* Dark overlay for better readability */}
      <div className="fixed inset-0 bg-black/50 pointer-events-none -z-10" />

      <motion.div
        className="flex flex-col gap-2 pb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Back button and Edit button */}
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center"
        >
          <Link href={`/events/${eventId}/${year}/companion`}>
            <BluePrintButton className="text-xs px-2.5 py-1.5">
              <ArrowLeft size={14} />
              Back
            </BluePrintButton>
          </Link>

          {isOwnProfile && (
            <BluePrintButton
              className="text-xs px-2.5 py-1.5"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={14} />
              Edit
            </BluePrintButton>
          )}
        </motion.div>

        {/* Profile Header */}
        <motion.div variants={itemVariants}>
          <ProfileHeader profile={profile} />
        </motion.div>

        {/* Profile Info (Academic or Professional) */}
        <motion.div variants={itemVariants}>
          <ProfileInfo profile={profile} />
        </motion.div>

        {/* About & Hobbies */}
        <motion.div variants={itemVariants}>
          <ProfileAbout profile={profile} />
        </motion.div>

        {/* Links */}
        <motion.div variants={itemVariants}>
          <ProfileLinks profile={profile} />
        </motion.div>
      </motion.div>
    </BluePrintLayout>
  );
}

// Profile Header Component
function ProfileHeader({ profile }: { profile: UserProfile }) {
  const fullName = `${profile.fname} ${profile.lname}`;
  const isPartner = profile.type === "Partner";
  const showProfilePicture =
    profile.profilePictureURL &&
    profile.viewableMap?.profilePictureURL !== false;
  const showPronouns =
    profile.pronouns && profile.viewableMap?.pronouns !== false;

  return (
    <div className="flex flex-col items-center gap-2 py-3">
      {/* Avatar with gradient border */}
      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#6299ff] to-[#EAE5D4] p-[2px]">
        <div className="w-full h-full rounded-full overflow-hidden bg-[#0A1428]">
          {showProfilePicture ? (
            <Image
              src={profile.profilePictureURL!}
              alt={fullName}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-medium text-white/60">
              {profile.fname[0]}
              {profile.lname[0]}
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <h1 className="text-xl font-medium bg-gradient-to-br from-[#6299ff] to-[#EAE5D4] bg-clip-text text-transparent">
        {fullName}
      </h1>

      {/* Pronouns & Type Badge */}
      <div className="flex items-center gap-2">
        {showPronouns && (
          <span className="text-xs text-[#778191]">{profile.pronouns}</span>
        )}
        <span
          className={`px-2 py-0.5 text-[10px] font-mono rounded-full border ${
            isPartner
              ? "bg-[#4972EF]/20 border-[#4972EF]/50 text-[#4972EF]"
              : "bg-white/10 border-white/30 text-white/80"
          }`}
        >
          {isPartner ? "PARTNER" : "ATTENDEE"}
        </span>
      </div>
    </div>
  );
}

// Profile Info Component
function ProfileInfo({ profile }: { profile: UserProfile }) {
  const isPartner = profile.type === "Partner";

  if (isPartner) {
    if (!profile.company && !profile.role) return null;

    return (
      <BluePrintCard className="bg-black/40 border-white/20">
        <div className="text-md font-medium mb-2">Professional Info</div>
        <div className="h-[0.5px] w-full bg-gradient-to-r from-transparent via-white to-transparent mb-4" />

        <div className="space-y-3">
          {profile.company && (
            <div className="flex items-center gap-3">
              <Building2 size={18} className="text-[#6299ff]" />
              <div>
                <div className="text-xs text-[#778191]">Company</div>
                <div className="text-sm text-white">{profile.company}</div>
              </div>
            </div>
          )}

          {profile.role && (
            <div className="flex items-center gap-3">
              <Briefcase size={18} className="text-[#6299ff]" />
              <div>
                <div className="text-xs text-[#778191]">Role</div>
                <div className="text-sm text-white">{profile.role}</div>
              </div>
            </div>
          )}
        </div>
      </BluePrintCard>
    );
  }

  if (!profile.major && !profile.year) return null;

  return (
    <BluePrintCard className="bg-black/40 border-white/20">
      <div className="text-md font-medium mb-2">Academic Info</div>
      <div className="h-[0.5px] w-full bg-gradient-to-r from-transparent via-white to-transparent mb-4" />

      <div className="space-y-3">
        {profile.major && (
          <div className="flex items-center gap-3">
            <GraduationCap size={18} className="text-[#6299ff]" />
            <div>
              <div className="text-xs text-[#778191]">Major</div>
              <div className="text-sm text-white">{profile.major}</div>
            </div>
          </div>
        )}

        {profile.year && (
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-[#6299ff]" />
            <div>
              <div className="text-xs text-[#778191]">Year</div>
              <div className="text-sm text-white">{profile.year}</div>
            </div>
          </div>
        )}
      </div>
    </BluePrintCard>
  );
}

// Profile About Component
function ProfileAbout({ profile }: { profile: UserProfile }) {
  const showDescription =
    profile.description && profile.viewableMap?.description !== false;
  const showHobby1 = profile.hobby1 && profile.viewableMap?.hobby1 !== false;
  const showHobby2 = profile.hobby2 && profile.viewableMap?.hobby2 !== false;
  const hasHobbies = showHobby1 || showHobby2;

  if (!showDescription && !hasHobbies) return null;

  return (
    <BluePrintCard className="bg-black/40 border-white/20">
      {showDescription && (
        <>
          <div className="text-md font-medium mb-2">About {profile.fname}</div>
          <div className="h-[0.5px] w-full bg-gradient-to-r from-transparent via-white to-transparent mb-4" />
          <p className="text-sm text-white/80 leading-relaxed mb-4">
            {profile.description}
          </p>
        </>
      )}

      {hasHobbies && (
        <>
          {showDescription && (
            <div className="h-[0.5px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent my-4" />
          )}
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-[#6299ff]" />
            <span className="text-md font-medium">Hobbies & Interests</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {showHobby1 && (
              <span className="px-3 py-1.5 text-sm bg-black/30 border border-white/20 rounded-full text-white/80">
                {profile.hobby1}
              </span>
            )}
            {showHobby2 && (
              <span className="px-3 py-1.5 text-sm bg-black/30 border border-white/20 rounded-full text-white/80">
                {profile.hobby2}
              </span>
            )}
          </div>
        </>
      )}
    </BluePrintCard>
  );
}

// Profile Links Component
function ProfileLinks({ profile }: { profile: UserProfile }) {
  const showLinkedIn =
    profile.linkedIn && profile.viewableMap?.linkedIn !== false;
  const showAdditionalLink =
    profile.additionalLink && profile.viewableMap?.additionalLink !== false;

  if (!showLinkedIn && !showAdditionalLink) return null;

  return (
    <div className="flex flex-col gap-3">
      {showLinkedIn && (
        <a
          href={
            profile.linkedIn!.startsWith("http")
              ? profile.linkedIn
              : `https://${profile.linkedIn}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <BluePrintButton className="w-full justify-center py-3">
            <Linkedin size={18} />
            <span>Connect on LinkedIn</span>
          </BluePrintButton>
        </a>
      )}

      {showAdditionalLink && (
        <a
          href={
            profile.additionalLink!.startsWith("http")
              ? profile.additionalLink
              : `https://${profile.additionalLink}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <BluePrintButton className="w-full justify-center py-3 bg-transparent border-white/30">
            <ExternalLink size={18} />
            <span>Additional Link</span>
          </BluePrintButton>
        </a>
      )}
    </div>
  );
}

interface ProfileFormData {
  description: string;
  hobby1: string;
  hobby2: string;
  funQuestion1: string;
  funQuestion2: string;
  linkedIn: string;
  additionalLink: string;
  profilePictureURL: string;
  viewableMap: Record<string, boolean>;
  [key: string]: unknown;
}

interface BluePrintEditProfileProps {
  profile: UserProfile;
  onCancel: () => void;
  onSave: (updatedProfile: UserProfile) => void;
  eventId: string;
  year: string;
  currentUserProfile: {
    viewableMap?: Record<string, boolean>;
    profilePictureURL?: string;
  } | null;
}

function BluePrintEditProfile({
  profile,
  onCancel,
  onSave,
  eventId,
  year,
  currentUserProfile,
}: BluePrintEditProfileProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      description: profile.description || "",
      hobby1: profile.hobby1 || "",
      hobby2: profile.hobby2 || "",
      funQuestion1: profile.funQuestion1 || "",
      funQuestion2: profile.funQuestion2 || "",
      linkedIn: profile.linkedIn || "",
      additionalLink: profile.additionalLink || "",
      profilePictureURL:
        currentUserProfile?.profilePictureURL ||
        profile.profilePictureURL ||
        "",
      viewableMap: currentUserProfile?.viewableMap || {},
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      // Auto-set viewableMap to true for fields that have values
      const updatedViewableMap: Record<string, boolean> = {
        ...data.viewableMap,
        description: !!data.description?.trim(),
        hobby1: !!data.hobby1?.trim(),
        hobby2: !!data.hobby2?.trim(),
        funQuestion1: !!data.funQuestion1?.trim(),
        funQuestion2: !!data.funQuestion2?.trim(),
        linkedIn: !!data.linkedIn?.trim(),
        additionalLink: !!data.additionalLink?.trim(),
        profilePictureURL: !!data.profilePictureURL?.trim(),
      };

      await fetchBackend({
        endpoint: "/profiles/user/",
        method: "PATCH",
        data: {
          ...data,
          viewableMap: updatedViewableMap,
        },
        authenticatedCall: true,
      });

      // Invalidate the userProfile cache so fresh data is fetched
      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      // Update the profile with new data
      const updatedProfile: UserProfile = {
        ...profile,
        description: data.description,
        hobby1: data.hobby1,
        hobby2: data.hobby2,
        funQuestion1: data.funQuestion1,
        funQuestion2: data.funQuestion2,
        linkedIn: data.linkedIn,
        additionalLink: data.additionalLink,
        profilePictureURL: data.profilePictureURL,
      };
      onSave(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
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
    <>
      {/* Dark overlay for better readability */}
      <div className="fixed inset-0 bg-black/50 pointer-events-none -z-10" />

      <motion.div
        className="flex flex-col gap-4 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center"
        >
          <BluePrintButton
            className="text-xs px-3 py-2"
            onClick={onCancel}
            type="button"
          >
            <X size={16} />
            Cancel
          </BluePrintButton>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-medium bg-gradient-to-br from-[#6299ff] to-[#EAE5D4] bg-clip-text text-transparent text-center">
            Edit Profile
          </h1>
        </motion.div>

        {/* Form */}
        <motion.div variants={itemVariants}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Description */}
            <BluePrintCard className="bg-black/40 border-white/20">
              <label className="text-sm font-medium text-white/80 mb-2 block">
                About You
              </label>
              <textarea
                {...register("description")}
                placeholder="Tell people about yourself..."
                rows={4}
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#6299ff]/50 resize-none"
              />
            </BluePrintCard>

            {/* Hobbies */}
            <BluePrintCard className="bg-black/40 border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-[#6299ff]" />
                <span className="text-sm font-medium text-white/80">
                  Hobbies & Interests
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  {...register("hobby1")}
                  placeholder="Hobby 1"
                  className="bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#6299ff]/50"
                />
                <input
                  {...register("hobby2")}
                  placeholder="Hobby 2"
                  className="bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#6299ff]/50"
                />
              </div>
            </BluePrintCard>

            {/* Fun Questions */}
            <BluePrintCard className="bg-black/40 border-white/20">
              <label className="text-sm font-medium text-white/80 mb-2 block">
                Fun Questions
              </label>
              <div className="flex flex-col gap-3">
                <input
                  {...register("funQuestion1")}
                  placeholder="Share something fun about yourself"
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#6299ff]/50"
                />
                <input
                  {...register("funQuestion2")}
                  placeholder="Another fun fact"
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#6299ff]/50"
                />
              </div>
            </BluePrintCard>

            {/* Links */}
            <BluePrintCard className="bg-black/40 border-white/20">
              <label className="text-sm font-medium text-white/80 mb-2 block">
                Social Links
              </label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Linkedin
                    size={18}
                    className="text-[#6299ff] flex-shrink-0"
                  />
                  <input
                    {...register("linkedIn")}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#6299ff]/50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink
                    size={18}
                    className="text-[#6299ff] flex-shrink-0"
                  />
                  <input
                    {...register("additionalLink")}
                    placeholder="https://yourportfolio.com"
                    className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#6299ff]/50"
                  />
                </div>
              </div>
            </BluePrintCard>

            {/* Submit Button */}
            <BluePrintButton
              type="submit"
              className="w-full justify-center py-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </BluePrintButton>
          </form>
        </motion.div>
      </motion.div>
    </>
  );
}
