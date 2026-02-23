import React from "react";
import { Control, UseFormWatch } from "react-hook-form";
import { FormField, FormItem } from "@/components/ui/form";
import { FormInput, FormMultiSelect, FormRadio, FormSelect } from "./FormInput";

export interface MembershipFormValues {
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

interface MembershipFormSectionProps {
  control: Control<MembershipFormValues>;
  watch: UseFormWatch<MembershipFormValues>;
  disableEmail: boolean 
}

const educationOptions = [
  { label: "I'm a UBC student", value: "UBC" },
  { label: "I'm a university student", value: "UNI" },
  { label: "Not Applicable", value: "NA" },
];

const pronounOptions = [
  { value: "He/Him/His", label: "He/Him/His" },
  { value: "She/Her/Hers", label: "She/Her/Hers" },
  { value: "They/Them/Theirs", label: "They/Them/Theirs" },
];

const levelOfStudyOptions = [
  { value: "1st Year", label: "1st Year" },
  { value: "2nd Year", label: "2nd Year" },
  { value: "3rd Year", label: "3rd Year" },
  { value: "4th Year", label: "4th Year" },
  { value: "5+ Year", label: "5+ Year" },
  { value: "Other", label: "Other" },
  { value: "Not Applicable", label: "Not Applicable" },
];

const facultyOptions = [
  { value: "Arts", label: "Arts" },
  { value: "Commerce", label: "Commerce" },
  { value: "Science", label: "Science" },
  { value: "Engineering", label: "Engineering" },
  { value: "Kinesiology", label: "Kinesiology" },
  { value: "Land and Food Systems", label: "Land and Food Systems" },
  { value: "Forestry", label: "Forestry" },
  { value: "Other", label: "Other" },
  { value: "Not Applicable", label: "Not Applicable" },
];

const yesNoOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const dietOptions = [
  { value: "None", label: "None" },
  { value: "Vegetarian", label: "Vegetarian" },
  { value: "Vegan", label: "Vegan" },
  { value: "Gluten-free", label: "Gluten-free" },
];

const topicOptions = [
  { value: "Software Engineering", label: "Software Engineering" },
  { value: "Product Management", label: "Product Management" },
  { value: "Cyber Security", label: "Cyber Security" },
  { value: "Consulting", label: "Consulting" },
  { value: "Data Science & Analytics", label: "Data Science & Analytics" },
  {
    value: "Artificial Intelligence & Machine Learning",
    label: "Artificial Intelligence & Machine Learning",
  },
  { value: "Entrepreneurship/Startups", label: "Entrepreneurship/Startups" },
  {
    value: "Marketing/Business Development",
    label: "Marketing/Business Development",
  },
  { value: "UX/UI Design", label: "UX/UI Design" },
  { value: "Other", label: "Other" },
];

const referralOptions = [
  { value: "Instagram", label: "Instagram" },
  { value: "TikTok", label: "TikTok" },
  { value: "Newsletter", label: "Newsletter" },
  { value: "Website", label: "Website" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Word of Mouth", label: "Word of Mouth" },
  { value: "Other", label: "Other" },
];

export default function MembershipFormSection({
  control,
  watch,
  disableEmail
}: MembershipFormSectionProps) {
  const isStudentNumberRequired = watch("education") === "UBC";

  return (
    <div className="border-b border-white/10 pb-12">
      <h2 className="text-base font-semibold leading-7 text-white">
        Personal Information
      </h2>

      <div className="mt-10 space-y-8">
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              {disableEmail ? 
              <FormInput
                title="Email Address *"
                field={field}
                type="email"
                disabled
              /> :
              <FormInput
                title="Email Address *"
                field={field}
                type="email"
              />}
              
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 gap-y-4">
          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormInput title="First Name *" field={field} type="text" />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormInput title="Last Name *" field={field} type="text" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="education"
          render={({ field }) => (
            <FormItem>
              <FormSelect
                title="Education *"
                field={field}
                items={educationOptions}
              />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="studentNumber"
          render={({ field }) => (
            <FormItem>
              <FormInput
                title={`Student Number${isStudentNumberRequired ? " *" : ""}`}
                field={field}
                type="text"
                placeholder={
                  isStudentNumberRequired
                    ? "Enter 8-digit student number"
                    : "Optional"
                }
              />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="pronouns"
          render={({ field }) => (
            <FormItem>
              <FormRadio
                title="Preferred Pronouns *"
                field={field}
                items={pronounOptions}
              />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          <FormField
            control={control}
            name="levelOfStudy"
            render={({ field }) => (
              <FormItem>
                <FormSelect
                  title="Level of Study *"
                  field={field}
                  items={levelOfStudyOptions}
                />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="faculty"
            render={({ field }) => (
              <FormItem>
                <FormSelect
                  title="Faculty *"
                  field={field}
                  items={facultyOptions}
                />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="major"
          render={({ field }) => (
            <FormItem>
              <FormInput title="Major *" field={field} type="text" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 gap-y-4">
          <FormField
            control={control}
            name="internationalStudent"
            render={({ field }) => (
              <FormItem>
                <FormSelect
                  title="Are you an international student? *"
                  field={field}
                  items={yesNoOptions}
                />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="dietaryRestrictions"
            render={({ field }) => (
              <FormItem>
                <FormSelect
                  title="Do you have dietary restrictions?"
                  field={field}
                  items={dietOptions}
                />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="previousMember"
          render={({ field }) => (
            <FormItem>
              <FormSelect
                title="Were you a BizTech member last year? *"
                field={field}
                items={yesNoOptions}
              />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="topics"
          render={({ field }) => (
            <FormItem>
              <FormMultiSelect
                title="Which business or tech career paths are you interested in?"
                field={field}
                items={topicOptions}
              />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="referral"
          render={({ field }) => (
            <FormItem>
              <FormSelect
                title="How did you hear about us? *"
                field={field}
                items={referralOptions}
              />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
