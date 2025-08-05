import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Amplify } from "aws-amplify";
import { fetchUserAttributes } from "@aws-amplify/auth";
import * as Yup from "yup";
import { useForm, FormProvider, Controller } from "react-hook-form";
import outputs from "../../amplify_outputs.json";
import { fetchBackend } from "@/lib/db";
import {
  FormInput,
  FormRadio,
  FormMultiSelect,
  FormSelect,
} from "../components/SignUpForm/FormInput";
import Link from "next/link";

interface MembershipFormValues {
  email: string;
  firstName: string;
  lastName: string;
  studentNumber: string;
  pronouns: string;
  levelOfStudy: string;
  faculty: string;
  major: string;
  internationalStudent: string;
  previousMember: string;
  dietaryRestrictions?: string;
  referral: string;
  topics: string[];
}

Amplify.configure(outputs);

const Membership = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const methods = useForm<MembershipFormValues>();

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const currentUser = await fetchUserAttributes();
        if (currentUser) {
          const userEmail = currentUser.email;
          if (userEmail) {
            setEmail(userEmail);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user attributes:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserEmail();
  }, []);

  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    studentNumber: Yup.string().required("Student number is required"),
    pronouns: Yup.string().required("Please select your pronouns"),
    levelOfStudy: Yup.string().required("Level of study is required"),
    faculty: Yup.string().required("Faculty is required"),
    major: Yup.string().required("Major is required"),
    internationalStudent: Yup.string().required(
      "Please specify if you are an international student",
    ),
    previousMember: Yup.string().required(
      "Please specify if you were a previous member",
    ),
    dietaryRestrictions: Yup.string().required(
      "Dietary restrictions are required",
    ),
    referral: Yup.string().required("Referral source is required"),
  });

  const onSubmit = async (values: MembershipFormValues) => {
    setIsSubmitting(true);
    const topicsString = values.topics.join(",");

    const userBody = {
      email,
      fname: values.firstName,
      lname: values.lastName,
      studentId: values.studentNumber,
      gender: values.pronouns,
      education: "University",
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
        await fetchBackend({
          endpoint: "/users",
          method: "POST",
          data: userBody,
        });
        router.push(`/signup/success/UserMember/${email}`);
      } else {
        const paymentBody = {
          paymentName: "BizTech Membership",
          paymentImages: ["https://imgur.com/TRiZYtG.png"],
          paymentType: "OAuthMember",
          success_url: `${
            process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
              ? "http://localhost:3000/"
              : "https://app.ubcbiztech.com/"
          }signup/success/Member/${email}`,
          cancel_url: `${
            process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
              ? "http://localhost:3000/"
              : "https://app.ubcbiztech.com/"
          }signup`,
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
    return <div>Loading...</div>;
  }

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-screen flex-1 flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 bg-login-page-bg">
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
                  className="text-sm leading-6 text-biztech-green underline"
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
                <Controller
                  name="email"
                  control={methods.control}
                  defaultValue={email}
                  render={({ field }) => (
                    <FormInput
                      title="Email Address *"
                      field={field}
                      type="email"
                      disabled
                    />
                  )}
                />

                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 gap-y-4">
                  <Controller
                    name="firstName"
                    control={methods.control}
                    defaultValue=""
                    render={({ field }) => (
                      <FormInput
                        title="First Name *"
                        field={field}
                        type="text"
                      />
                    )}
                  />
                  <Controller
                    name="lastName"
                    control={methods.control}
                    defaultValue=""
                    render={({ field }) => (
                      <FormInput
                        title="Last Name *"
                        field={field}
                        type="text"
                      />
                    )}
                  />
                </div>

                <Controller
                  name="studentNumber"
                  control={methods.control}
                  defaultValue=""
                  render={({ field }) => (
                    <FormInput
                      title="Student Number *"
                      field={field}
                      type="text"
                    />
                  )}
                />

                <Controller
                  name="pronouns"
                  control={methods.control}
                  defaultValue=""
                  render={({ field }) => (
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
                  )}
                />

                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                  <Controller
                    name="levelOfStudy"
                    control={methods.control}
                    defaultValue=""
                    render={({ field }) => (
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
                          { value: "Not Applicable", label: "Not Applicable" },
                        ]}
                      />
                    )}
                  />
                  <Controller
                    name="faculty"
                    control={methods.control}
                    defaultValue=""
                    render={({ field }) => (
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
                          { value: "Not Applicable", label: "Not Applicable" },
                        ]}
                      />
                    )}
                  />
                </div>

                <Controller
                  name="major"
                  control={methods.control}
                  defaultValue=""
                  render={({ field }) => (
                    <FormInput title="Major *" field={field} type="text" />
                  )}
                />

                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 gap-y-4">
                  <Controller
                    name="internationalStudent"
                    control={methods.control}
                    defaultValue=""
                    render={({ field }) => (
                      <FormSelect
                        title="Are you an international student? *"
                        field={field}
                        items={[
                          { value: "Yes", label: "Yes" },
                          { value: "No", label: "No" },
                        ]}
                      />
                    )}
                  />
                  <Controller
                    name="dietaryRestrictions"
                    control={methods.control}
                    defaultValue="None"
                    render={({ field }) => (
                      <FormSelect
                        title="Do you have any dietary restrictions?"
                        field={field}
                        items={[
                          { value: "None", label: "None" },
                          { value: "Vegetarian", label: "Vegetarian" },
                          { value: "Vegan", label: "Vegan" },
                          { value: "Gluten-free", label: "Gluten-free" },
                        ]}
                      />
                    )}
                  />
                </div>

                <Controller
                  name="previousMember"
                  control={methods.control}
                  defaultValue=""
                  render={({ field }) => (
                    <FormSelect
                      title="Were you a BizTech member last year? *"
                      field={field}
                      items={[
                        { value: "Yes", label: "Yes" },
                        { value: "No", label: "No" },
                      ]}
                    />
                  )}
                />

                <Controller
                  name="topics"
                  control={methods.control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <FormMultiSelect
                      title="What topics do you want to see discussed in future events?"
                      field={field}
                      items={[
                        { value: "Cyber Security", label: "Cyber Security" },
                        { value: "AI", label: "AI" },
                        { value: "Tech Startups", label: "Tech Startups" },
                        { value: "eCommerce", label: "eCommerce" },
                        { value: "Health Tech", label: "Health Tech" },
                        {
                          value: "Careers in the Tech Industry",
                          label: "Careers in the Tech Industry",
                        },
                      ]}
                    />
                  )}
                />

                <Controller
                  name="referral"
                  control={methods.control}
                  defaultValue=""
                  render={({ field }) => (
                    <FormInput
                      title="How did you hear about us?"
                      field={field}
                      type="text"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="submit"
              className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400"
              disabled={isSubmitting}
            >
              Proceed to Payment
            </button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default Membership;
