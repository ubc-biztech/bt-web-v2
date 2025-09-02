import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Amplify } from "aws-amplify";
import { fetchUserAttributes, signOut } from "@aws-amplify/auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import outputs from "../../amplify_outputs.json";
import { fetchBackend, fetchBackendFromServer } from "@/lib/db";
import {
  FormInput,
  FormRadio,
  FormMultiSelect,
  FormSelect,
} from "../components/SignUpForm/FormInput";
import Link from "next/link";
import { GetServerSideProps } from "next";
import PageLoadingState from "@/components/Common/PageLoadingState";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { FormField, FormItem } from "@/components/ui/form";
import { generateStageURL } from "@/util/url";

interface MembershipFormValues {
  email: string;
  firstName: string;
  lastName: string;
  studentNumber?: string;
  education: string;
  pronouns: string;
  levelOfStudy: string;
  faculty: string;
  major: string;
  internationalStudent: string;
  previousMember: string;
  dietaryRestrictions: string;
  referral: string;
  topics: string[];
}

interface MembershipProps {
  isUser: boolean;
}

Amplify.configure(outputs, { ssr: true });

const validationSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    education: z.string().min(1, "Education selection is required"),
    studentNumber: z.string().optional(),
    pronouns: z.string().min(1, "Please select your pronouns"),
    levelOfStudy: z.string().min(1, "Level of study is required"),
    faculty: z.string().min(1, "Faculty is required"),
    major: z.string().min(1, "Major is required"),
    internationalStudent: z
      .string()
      .min(1, "Please specify if you are an international student"),
    previousMember: z
      .string()
      .min(1, "Please specify if you were a previous member"),
    dietaryRestrictions: z.string().min(1, "Dietary restrictions are required"),
    referral: z.string().min(1, "Referral source is required"),
    topics: z.array(z.string()),
  })
  .refine(
    (data) => {
      if (data.education === "UBC") {
        return data.studentNumber && /^\d{8}$/.test(data.studentNumber);
      }
      return true;
    },
    {
      message: "Student number must be an 8 digit number for UBC students",
      path: ["studentNumber"],
    },
  );

const Membership: React.FC<MembershipProps> = ({ isUser }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const methods = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: email,
      firstName: "",
      lastName: "",
      education: "",
      studentNumber: "",
      pronouns: "",
      levelOfStudy: "",
      faculty: "",
      major: "",
      internationalStudent: "",
      previousMember: "",
      dietaryRestrictions: "None",
      referral: "",
      topics: [],
    },
  });

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const currentUser = await fetchUserAttributes();
        if (currentUser && currentUser.email) {
          setEmail(currentUser.email);
          methods.setValue("email", currentUser.email);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user attributes:", error);
        await signOut({
          global: false,
          oauth: {
            redirectUrl: `${generateStageURL()}/login`,
          },
        });
        await router.push(`/login`);
      }
    };

    getUserEmail();
  }, [router, methods]);

  const onSubmit = async (values: MembershipFormValues) => {
    setIsSubmitting(true);
    const topicsString = values.topics.join(",");

    const userBody = {
      email,
      fname: values.firstName,
      lname: values.lastName,
      studentId: values.studentNumber,
      gender: values.pronouns,
      education: values.education,
      faculty: values.faculty,
      major: values.major,
      diet: values.dietaryRestrictions || "None",
      year: values.levelOfStudy,
      international: values.internationalStudent === "Yes",
      prev_member: values.previousMember === "Yes",
      isMember: true,
      admin: email.endsWith("@ubcbiztech.com"),
    };

    try {
      if (userBody.admin) {
        await Promise.all([
          fetchBackend({
            endpoint: "/members",
            method: "POST",
            data: {
              email: userBody.email,
              education: userBody.education,
              first_name: userBody.fname,
              last_name: userBody.lname,
              pronouns: userBody.gender,
              student_number: userBody.studentId,
              faculty: userBody.faculty,
              year: userBody.year,
              major: userBody.major,
              prev_member: userBody.prev_member,
              international: userBody.international,
              topics: topicsString,
              heard_from: values.referral,
              diet: userBody.diet,
              admin: userBody.admin,
            },
          }),
          fetchBackend({
            endpoint: isUser ? `/users/${userBody.email}` : "/users",
            method: isUser ? "PATCH" : "POST",
            data: { ...userBody, admin: undefined },
          }),
        ]);

        await fetchBackend({
          endpoint: "/profiles",
          method: "POST",
        });
        router.push(`/`);
      } else {
        const paymentBody = {
          paymentName: "BizTech Membership",
          paymentImages: ["https://imgur.com/TRiZYtG.png"],
          paymentType: isUser ? "Member" : "OAuthMember",
          success_url: `${
            process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
              ? "http://localhost:3000/"
              : process.env.NEXT_PUBLIC_REACT_APP_STAGE === "staging"
                ? "https://dev.v2.ubcbiztech.com/"
                : "https://app.ubcbiztech.com/"
          }`,
          cancel_url: `${
            process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
              ? "http://localhost:3000/"
              : process.env.NEXT_PUBLIC_REACT_APP_STAGE === "staging"
                ? "https://dev.v2.ubcbiztech.com/"
                : "https://app.ubcbiztech.com/"
          }membership`,
          education: userBody.education,
          student_number: userBody.studentId,
          fname: userBody.fname,
          lname: userBody.lname,
          major: userBody.major,
          email: userBody.email,
          year: userBody.year,
          faculty: userBody.faculty,
          pronouns: userBody.gender,
          diet: userBody.diet,
          prev_member: userBody.prev_member,
          international: userBody.international,
          referral: values.referral,
          topics: topicsString,
        };

        const response = await fetchBackend({
          endpoint: "/payments",
          method: "POST",
          data: paymentBody,
        });

        window.open(response, "_self");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoadingState />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-screen flex-1 flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 bg-bt-blue-600">
        <form
          className="max-w-xl mx-auto mt-12 px-4"
          onSubmit={methods.handleSubmit(onSubmit)}
        >
          <div className="space-y-12">
            <div className="border-b border-white/10 pb-12 text-center">
              <h2 className="text-base font-semibold leading-7 text-white">
                Create your user!
              </h2>
              <p className="mt-8 text-sm leading-6 text-white">
                Create an account to sign up for our events and become a BizTech
                member.
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="text-sm leading-6 text-bt-green-300 underline"
                  onClick={async (e) => {
                    e.preventDefault();

                    try {
                      await signOut({
                        global: true,
                        oauth: { redirectUrl: `${generateStageURL()}/login` },
                      });
                      await router.push("/login");
                    } catch (error) {
                      console.error("error signing in", error);
                    }
                  }}
                >
                  Back to Login Page
                </Link>
              </div>
            </div>

            <div className="border-b border-white/10 pb-12">
              <h2 className="text-base font-semibold leading-7 text-white">
                Personal Information
              </h2>

              <div className="mt-10 space-y-8">
                <FormField
                  control={methods.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormInput
                        title="Email Address *"
                        field={field}
                        type="email"
                        disabled
                      />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 gap-y-4">
                  <FormField
                    control={methods.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormInput
                          title="First Name *"
                          field={field}
                          type="text"
                        />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormInput
                          title="Last Name *"
                          field={field}
                          type="text"
                        />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={methods.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormSelect
                        title="Education *"
                        field={field}
                        items={[
                          { label: "I'm a UBC student", value: "UBC" },
                          { label: "I'm a university student", value: "UNI" },
                          { label: "Not Applicable", value: "NA" },
                        ]}
                      />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="studentNumber"
                  render={({ field }) => {
                    const education = methods.watch("education");
                    const isRequired = education === "UBC";
                    return (
                      <FormItem>
                        <FormInput
                          title={`Student Number${isRequired ? " *" : ""}`}
                          field={field}
                          type="text"
                          placeholder={
                            isRequired
                              ? "Enter 8-digit student number"
                              : "Optional"
                          }
                        />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={methods.control}
                  name="pronouns"
                  render={({ field }) => (
                    <FormItem>
                      <FormRadio
                        title="Preferred Pronouns *"
                        field={field}
                        items={[
                          { value: "He/Him/His", label: "He/Him/His" },
                          { value: "She/Her/Hers", label: "She/Her/Hers" },
                          {
                            value: "They/Them/Theirs",
                            label: "They/Them/Theirs",
                          },
                        ]}
                      />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                  <FormField
                    control={methods.control}
                    name="levelOfStudy"
                    render={({ field }) => (
                      <FormItem>
                        <FormSelect
                          title="Level of Study *"
                          field={field}
                          items={[
                            { value: "1st Year", label: "1st Year" },
                            { value: "2nd Year", label: "2nd Year" },
                            { value: "3rd Year", label: "3rd Year" },
                            { value: "4th Year", label: "4th Year" },
                            { value: "5+ Year", label: "5+ Year" },
                            { value: "Other", label: "Other" },
                            {
                              value: "Not Applicable",
                              label: "Not Applicable",
                            },
                          ]}
                        />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name="faculty"
                    render={({ field }) => (
                      <FormItem>
                        <FormSelect
                          title="Faculty *"
                          field={field}
                          items={[
                            { value: "Arts", label: "Arts" },
                            { value: "Commerce", label: "Commerce" },
                            { value: "Science", label: "Science" },
                            { value: "Engineering", label: "Engineering" },
                            { value: "Kinesiology", label: "Kinesiology" },
                            {
                              value: "Land and Food Systems",
                              label: "Land and Food Systems",
                            },
                            { value: "Forestry", label: "Forestry" },
                            { value: "Other", label: "Other" },
                            {
                              value: "Not Applicable",
                              label: "Not Applicable",
                            },
                          ]}
                        />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={methods.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormInput title="Major *" field={field} type="text" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 gap-y-4">
                  <FormField
                    control={methods.control}
                    name="internationalStudent"
                    render={({ field }) => (
                      <FormItem>
                        <FormSelect
                          title="Are you an international student? *"
                          field={field}
                          items={[
                            { value: "Yes", label: "Yes" },
                            { value: "No", label: "No" },
                          ]}
                        />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name="dietaryRestrictions"
                    render={({ field }) => (
                      <FormItem>
                        <FormSelect
                          title="Do you have dietary restrictions?"
                          field={field}
                          items={[
                            { value: "None", label: "None" },
                            { value: "Vegetarian", label: "Vegetarian" },
                            { value: "Vegan", label: "Vegan" },
                            { value: "Gluten-free", label: "Gluten-free" },
                          ]}
                        />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={methods.control}
                  name="previousMember"
                  render={({ field }) => (
                    <FormItem>
                      <FormSelect
                        title="Were you a BizTech member last year? *"
                        field={field}
                        items={[
                          { value: "Yes", label: "Yes" },
                          { value: "No", label: "No" },
                        ]}
                      />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="topics"
                  render={({ field }) => (
                    <FormItem>
                      <FormMultiSelect
                        title="Which business or tech career paths are you interested in?"
                        field={field}
                        items={[
                          {
                            value: "Software Engineering",
                            label: "Software Engineering",
                          },
                          {
                            value: "Product Management",
                            label: "Product Management",
                          },
                          {
                            value: "Cyber Security",
                            label: "Cyber Security",
                          },
                          { value: "Consulting", label: "Consulting" },
                          {
                            value: "Data Science & Analytics",
                            label: "Data Science & Analytics",
                          },
                          {
                            value: "Artificial Intelligence & Machine Learning",
                            label: "Artificial Intelligence & Machine Learning",
                          },
                          {
                            value: "Entrepreneurship/Startups",
                            label: "Entrepreneurship/Startups",
                          },
                          {
                            value: "Marketing/Business Development",
                            label: "Marketing/Business Development",
                          },
                          { value: "UX/UI Design", label: "UX/UI Design" },
                          { value: "Other", label: "Other" },
                        ]}
                      />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="referral"
                  render={({ field }) => (
                    <FormItem>
                      <FormSelect
                        title="How did you hear about us? *"
                        field={field}
                        items={[
                          { value: "Instagram", label: "Instagram" },
                          { value: "TikTok", label: "TikTok" },
                          { value: "Newsletter", label: "Newsletter" },
                          { value: "Website", label: "Website" },
                          { value: "LinkedIn", label: "LinkedIn" },
                          { value: "Word of Mouth", label: "Word of Mouth" },
                          { value: "Other", label: "Other" },
                        ]}
                      />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="submit"
              className="rounded-md bg-bt-green-300 px-3 py-2 text-sm font-semibold text-bt-blue-500 shadow-sm hover:bg-bt-green-500"
              disabled={isSubmitting}
            >
              {email.toLowerCase().endsWith("@ubcbiztech.com")
                ? "Create Membership"
                : "Proceed to Payment"}
            </button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const nextServerContext = { request: req, response: res };

  try {
    const userProfile = await fetchBackendFromServer({
      endpoint: `/users/self`,
      method: "GET",
      nextServerContext,
    });

    if (userProfile?.isMember) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    return {
      props: {
        isUser: !!userProfile,
      },
    };
  } catch (error) {
    return {
      props: {
        isUser: false,
      },
    };
  }
};

export default Membership;
