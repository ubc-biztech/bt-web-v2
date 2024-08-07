"use client"

import React from 'react';
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

enum LevelOfStudy {
    First = "1st Year",
    Second = "2nd Year",
    Third = "3rd Year",
    Fourth = "4th Year",
    Fifth = "5th Year",
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

//Currently biztechPast is a string, but it should be a boolean`
const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    studentNumber: z.string().length(8, "Student number must be 8 characters"),
    educationLevel: z.nativeEnum(EducationLevel),
    pronouns: z.array(z.nativeEnum(Pronouns)),
    levelOfStudy: z.nativeEnum(LevelOfStudy),
    faculty: z.nativeEnum(Faculty),
    major: z.string(),
    internationalStudent: z.string(),
    dietaryRestrictions: z.nativeEnum(DietaryRestrictions),
    biztechPast: z.string(),
    topicsOfInterest: z.array(z.nativeEnum(TopicsOfInterest)),
    howDidYouHearAboutUs: z.nativeEnum(HowDidYouHearAboutUs),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirm"],
});

type FormSchema = z.infer<typeof schema>;

export default function SignUp() {
    const router = useRouter();

    const returnLogin = () => {
        router.push('/login')
    }

    const form = useForm<FormSchema>({
        resolver: zodResolver(schema),
        mode: "onBlur"
    })

    const submitForm = async (data: FormSchema) => {
        console.log('onsubmit called')
        try {
            //TODO : Currently just printing
          console.log(data);
        } catch (error) {
          console.error("Form submission error:", error);
        }
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
                            title="Please select the option most relevant to you."
                            field={field}
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
                        <FormInput type='text' title='Last Name*' name="lastName" field={field} />
                    )}
                />
                <FormField
                    control={form.control}
                    name="studentNumber"
                    render={({ field }) => (
                        <FormInput type='text' title='Student Number*' field={field}/>
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
                    name="faculty"
                    render={({field}) => (
                        <FormSelect
                            items={Object.entries(Faculty).map(([key, value]) => ({ value, label: value }))}
                            title="Faculty*"
                            field={field} />  
                    )}/>
                <FormField
                    control={form.control}
                    name="levelOfStudy"
                    render={({field}) => (
                        <FormSelect
                            items={Object.entries(LevelOfStudy).map(([key, value]) => ({ value, label: value }))}
                            title="Level of Study*"
                            field={field} />  
                    )}/>
                <FormField
                    control={form.control}
                    name="major"
                    render={({ field }) => (
                        <FormInput type='text' title='Major*' field={field}/>
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
                <FormField
                    control={form.control}
                    name={"biztechPast"}
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
                    name={"dietaryRestrictions"}
                    render={({ field }) => (
                        <FormSelect
                            items={Object.entries(DietaryRestrictions).map(([key, value]) => ({ value, label: value }))}
                            title="Dietary Restrictions*"
                            field={field}
                        />
                    )}/>
                <FormField
                    control={form.control}
                    name={"topicsOfInterest"}
                    render={({ field }) => (
                        <FormMultiSelect
                            items={Object.entries(TopicsOfInterest).map(([key, value]) => ({ value, label: value }))}
                            title="Topics of Interest*"
                            field={field}
                        />
                    )}/>
                <FormField
                    control={form.control}
                    name={"howDidYouHearAboutUs"}
                    render={({ field }) => (
                        <FormSelect
                            items={Object.entries(HowDidYouHearAboutUs).map(([key, value]) => ({ value, label: value }))}
                            title="How did you hear about us*?"
                            field={field}
                        />
                    )}/>

                {/* DIVIDER */}
                <div className="w-full h-0.5 bg-white-blue my-6"></div>
                <button type="submit" className="bg-biztech-green py-1 px-4 rounded mr-auto text-login-form-card" aria-label="Submit Form">Submit</button>
            </form>
        </Form>
        </main>
    )
}