"use client"

import React, { useState } from 'react';
import { useForm } from "react-hook-form"
import { Schema, z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from "next/image";
import { useRouter } from 'next/router';

import { FormInput, FormRadio, FormMultiSelect, FormSelect } from './FormInput'
import backArrowSvg from '../../../public/assets/icons/back_icon.svg';
import {
    Form,
    FormField
} from "@/components/ui/form"

//ENUMS for the Zod Schema
enum EducationLevel {
    HighSchool = "High School",
    University = "University",
    UBC = "UBC",
    NoneAbove = "None of the Above"
}

enum Pronouns {
    HeHim = "He/Him",
    SheHer = "She/Her",
    TheyThem = "They/Them",
    Other = "Others"
}

enum LevelOfStudyUni {
    First = "1st Year",
    Second = "2nd Year",
    Third = "3rd Year",
    Fourth = "4th Year",
    Fifth = "5th Year",
    Other = "Other",
    NotApplicable = "Not Applicable"
}

enum LevelOfStudyHS {
    Grade9 = "Grade 9",
    Grade10 = "Grade 10",
    Grade11 = "Grade 11",
    Grade12 = "Grade 12",
    Other = "Other",
    NotApplicable = "Not Applicable"
}

enum DietaryRestrictions {
    Vegetarian = "Vegetarian",
    Vegan = "Vegan",
    GlutenFree = "Gluten Free",
    Pescetarian = "Pescetarian",
    Halal = "Halal",
    Kosher = "Kosher",
    None = "None"
}

enum Faculty {
    Arts = "Arts",
    Science = "Science",
    Engineering = "Engineering",
    Commerce = "Commerce",
    Kinesiology = "Kinesiology",
    Forestry = "Forestry",
    Other = "Other",
    NotApplicable = "Not Applicable"
}

enum TopicsOfInterest {
    CyberSecurity = "Cyber Security",
    AI = "Artificial Intelligence",
    Startups = "Tech Startups",
    eCommerce = "eCommerce",
    HealthTech = "Health Tech",
    CareersInTech  = "Careers in the Tech Industry",
}

enum HowDidYouHearAboutUs {
    Facebook = "Facebook",
    Instagram = "Instagram",
    LinkedIn = "LinkedIn",
    Boothing = "Boothing",
    FriendsWordOfMouth = "Friends/Word of Mouth",
    BizTechNewsletter = "BizTech Newsletter",
    FacultyNewsletter = "Faculty Newsletter",
    Posters = "Posters",
    Events = "Events",
    Other = "Other"
}

const baseSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    educationLevel: z.nativeEnum(EducationLevel),
    pronouns: z.array(z.nativeEnum(Pronouns)),
    dietaryRestrictions: z.nativeEnum(DietaryRestrictions),
    biztechPast: z.string().min(1, "Please select Yes/No"),
    topicsOfInterest: z.array(z.nativeEnum(TopicsOfInterest)),
    howDidYouHearAboutUs: z.nativeEnum(HowDidYouHearAboutUs),
  });
  
  const highSchoolSchema = baseSchema.extend({
    year: z.nativeEnum(LevelOfStudyHS),
    highSchool: z.string().min(1, "High School is required"),
  });
  
  const universitySchema = baseSchema.extend({
    university: z.string().min(1, "University name is required"),
    faculty: z.nativeEnum(Faculty),
    year: z.nativeEnum(LevelOfStudyUni),
    major: z.string().min(1, "Major is required"),
  });
  
  const ubcSchema = baseSchema.extend({
    studentNumber: z.string().regex(/^\d{8}$/, "Valid Student ID required"),
    faculty: z.nativeEnum(Faculty),
    year: z.nativeEnum(LevelOfStudyUni),
    major: z.string().min(1, "Major is required"),
    internationalStudent: z.string().min(1, "International or domestic student indication is required"),
  });
  
  const formSchema = z.discriminatedUnion('educationLevel', [
    highSchoolSchema.extend({ educationLevel: z.literal(EducationLevel.HighSchool) }),
    universitySchema.extend({ educationLevel: z.literal(EducationLevel.University) }),
    ubcSchema.extend({ educationLevel: z.literal(EducationLevel.UBC) }),
    baseSchema.extend({ educationLevel: z.literal(EducationLevel.NoneAbove) }),
  ]).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
  
  type FormSchema = z.infer<typeof formSchema>;

  export default function SignUp() {
    const router = useRouter();

    const returnLogin = () => {
        router.push('/login')
    }

    const [educationLevel, setEducationLevel] = useState<EducationLevel | null>(null);

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            educationLevel: EducationLevel.NoneAbove,
            pronouns: [],
            dietaryRestrictions: DietaryRestrictions.None,
            biztechPast: '',
            topicsOfInterest: [],
            howDidYouHearAboutUs: HowDidYouHearAboutUs.Other,
        }
    });

    // The switch statement is needed as the discrimiated union type in the Zod schame doesn't correctly infer the educationLevel type.
    const getResetValues = (value: EducationLevel, currentValues: FormSchema): Partial<FormSchema> => {
        const baseValues = {
            email: currentValues.email,
            password: currentValues.password,
            confirmPassword: currentValues.confirmPassword,
            firstName: currentValues.firstName,
            lastName: currentValues.lastName,
            pronouns: currentValues.pronouns,
            dietaryRestrictions: currentValues.dietaryRestrictions,
            biztechPast: currentValues.biztechPast,
            topicsOfInterest: currentValues.topicsOfInterest,
            howDidYouHearAboutUs: currentValues.howDidYouHearAboutUs,
        };
    
        switch (value) {
            case EducationLevel.HighSchool:
                return {
                    ...baseValues,
                    educationLevel: EducationLevel.HighSchool,
                    year: LevelOfStudyHS.NotApplicable,
                    highSchool: '',
                };
            case EducationLevel.University:
                return {
                    ...baseValues,
                    educationLevel: EducationLevel.University,
                    university: '',
                    faculty: Faculty.NotApplicable,
                    year: LevelOfStudyUni.NotApplicable,
                    major: '',
                };
            case EducationLevel.UBC:
                return {
                    ...baseValues,
                    educationLevel: EducationLevel.UBC,
                    studentNumber: '',
                    faculty: Faculty.NotApplicable,
                    year: LevelOfStudyUni.NotApplicable,
                    major: '',
                    internationalStudent: '',
                };
            case EducationLevel.NoneAbove:
                return {
                    ...baseValues,
                    educationLevel: EducationLevel.NoneAbove,
                };
        }
    };

    const onEducationLevelChange = (value: EducationLevel) => {
        setEducationLevel(value);
        const currentValues = form.getValues();
        form.reset(getResetValues(value, currentValues));
    };


    const submitForm = async (data: FormSchema) => {
        console.log(data);
        // TODO: SEND DATA TO BACKEND
    };

    return (
        <main className="bg-primary-color min-h-screen px-4 py-6">
            <div className="flex flex-col items-center mb-12 pt-6 w-10/ text-center">
                <h3 className="text-white-blue pb-3">Create your Account</h3>
                <p className="text-white-blue pb-5 px-4 text-sm sm:text-md">Create an account to sign up for our events and become a BizTech member.</p>
                <span className="flex flex-row items-center">
                    <button className="text-biztech-green underline pr-1" onClick={returnLogin}>Back to Login Page</button>
                    <Image src={backArrowSvg} alt="Back Arrow"/>
                </span>
            </div>

            <Form {...form}>
                <form className="flex flex-col items-center gap-4 w-fit mx-auto" onSubmit={form.handleSubmit(submitForm)}>
                    <FormField
                        control={form.control}
                        name="educationLevel"
                        render={({ field }) => (
                            <FormRadio
                                items={Object.entries(EducationLevel).map(([key, value]) => ({ value, label: value }))}
                                title="Please select the option most relevant to you.*"
                                field={{
                                    ...field,
                                    onChange: (value: EducationLevel) => {
                                        field.onChange(value);
                                        onEducationLevelChange(value as EducationLevel);
                                    },
                                }}
                            />
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormInput type='email' title='Email Address*' field={field} />
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormInput type='password' title='Password*' field={field} />
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormInput type='password' title='Confirm Password*' field={field} />
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormInput type='text' title='First Name*' field={field}/>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormInput type='text' title='Last Name*' field={field} />
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="pronouns"
                        render={({ field }) => (
                            <FormMultiSelect 
                                items={Object.entries(Pronouns).map(([key, value]) => ({ value, label: value }))}
                                title="Preferred Pronouns*"
                                field={field}/>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dietaryRestrictions"
                        render={({ field }) => (
                            <FormSelect
                                items={Object.entries(DietaryRestrictions).map(([key, value]) => ({ value, label: value }))}
                                title="Dietary Restrictions*"
                                field={field}
                            />
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="biztechPast"
                        render={({ field }) => (
                            <FormSelect
                                items={[
                                    { value: "true", label: "Yes" },
                                    { value: "false", label: "No" },
                                ]}
                                title="Have you been involved with BizTech in the past?*"
                                field={field}
                            />
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="topicsOfInterest"
                        render={({ field }) => (
                            <FormMultiSelect
                                items={Object.entries(TopicsOfInterest).map(([key, value]) => ({ value, label: value }))}
                                title="Topics of Interest*"
                                field={field}
                            />
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="howDidYouHearAboutUs"
                        render={({ field }) => (
                            <FormSelect
                                items={Object.entries(HowDidYouHearAboutUs).map(([key, value]) => ({ value, label: value }))}
                                title="How did you hear about us?*"
                                field={field}
                            />
                        )}
                    />

                    {/* Conditional fields based on education level */}
                    {educationLevel === EducationLevel.HighSchool && (
                        <>
                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormSelect
                                        items={Object.entries(LevelOfStudyHS).map(([key, value]) => ({ value, label: value }))}
                                        title="Level of Study*"
                                        field={field}
                                    />
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="highSchool"
                                render={({ field }) => (
                                    <FormInput type='text' title='High School*' field={field} />
                                )}
                            />
                        </>
                    )}

                    {(educationLevel === EducationLevel.University || educationLevel === EducationLevel.UBC) && (
                        <>
                            <FormField
                                control={form.control}
                                name="faculty"
                                render={({ field }) => (
                                    <FormSelect
                                        items={Object.entries(Faculty).map(([key, value]) => ({ value, label: value }))}
                                        title="Faculty*"
                                        field={field}
                                    />
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormSelect
                                        items={Object.entries(LevelOfStudyUni).map(([key, value]) => ({ value, label: value }))}
                                        title="Level of Study*"
                                        field={field}
                                    />
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="major"
                                render={({ field }) => (
                                    <FormInput type='text' title='Major*' field={field} />
                                )}
                            />
                        </>
                    )}

                    {educationLevel === EducationLevel.University && (
                        <FormField
                            control={form.control}
                            name="university"
                            render={({ field }) => (
                                <FormInput type='text' title='University*' field={field} />
                            )}
                        />
                    )}

                    {educationLevel === EducationLevel.UBC && (
                        <>
                            <FormField
                                control={form.control}
                                name="studentNumber"
                                render={({ field }) => (
                                    <FormInput type='text' title='Student Number*' field={field} />
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="internationalStudent"
                                render={({ field }) => (
                                    <FormSelect
                                        items={[
                                            { value: 'true', label: "Yes" },
                                            { value: 'false', label: "No" },
                                        ]}
                                        title="Are you an international student?*"
                                        field={field}
                                    />
                                )}
                            />
                        </>
                    )}

                    <button type="submit" className="bg-biztech-green py-1 px-4 rounded mr-auto text-login-form-card" aria-label="Submit Form">Submit</button>
                </form>
            </Form>
        </main>
    );
}