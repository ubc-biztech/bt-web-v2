"use client"

import React from 'react';
import { useForm } from "react-hook-form"
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from "next/image";

import { FormInput, FormRadio, FormMultiSelect, FormSelect } from './FormInput'
import backArrowSvg from '../../../public/assets/icons/back_icon.svg';
import {
    Form,
    FormField
} from "@/components/ui/form"

// create an Enum for multi-select options
enum EducationLevel {
    HighSchool = "High School",
    University = "University",
    UBC = "UBC",
    NoneAbove = "NoneAbove"
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

enum dietaryRestrictions {
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

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    firstName: z.string(),
    lastName: z.string(),
    studentNumber: z.string().length(8),
    educationLevel: z.nativeEnum(EducationLevel),
    pronouns: z.nativeEnum(Pronouns),
    levelOfStudy: z.nativeEnum(LevelOfStudy),
    faculty: z.nativeEnum(Faculty),
    major: z.string(),
    internationalStudent: z.boolean(),
    dietaryRestrictions: z.nativeEnum(dietaryRestrictions),
    biztechPast: z.boolean(),
    topicsOfInterest: z.nativeEnum(TopicsOfInterest),
    howDidYouHearAboutUs: z.nativeEnum(HowDidYouHearAboutUs),
})

type FormSchema = z.infer<typeof schema>;


export default function SignUp() {
    const form = useForm<FormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    const uniOptions = [
        { value: EducationLevel.HighSchool, label: "High School" },
        { value: EducationLevel.University, label: "University" },
        { value: EducationLevel.UBC, label: "UBC" },
        { value: EducationLevel.NoneAbove, label: "None of the above" },
    ]

    const pronounOptions = [
        { value: Pronouns.HeHim, label: "He/Him" },
        { value: Pronouns.SheHer, label: "She/Her" },
        { value: Pronouns.TheyThem, label: "They/Them" },
        { value: Pronouns.Other, label: "Others" },
    ]

    const facultyOptions = [
        { value: Faculty.Arts, label: "Arts" },
        { value: Faculty.Science, label: "Science" },
        { value: Faculty.Engineering, label: "Engineering" },
        { value: Faculty.Commerce, label: "Commerce" },
        { value: Faculty.Kinesiology, label: "Kinesiology" },
        { value: Faculty.Forestry, label: "Forestry" },
        { value: Faculty.Other, label: "Other" },
        { value: Faculty.NotApplicable, label: "Not Applicable" },
    ]

    const levelOfStudyOptions = [
        { value: LevelOfStudy.First, label: "1st Year" },
        { value: LevelOfStudy.Second, label: "2nd Year" },
        { value: LevelOfStudy.Third, label: "3rd Year" },
        { value: LevelOfStudy.Fourth, label: "4th Year" },
        { value: LevelOfStudy.Fifth, label: "5th Year" },
        { value: LevelOfStudy.Other, label: "Other" },
        { value: LevelOfStudy.NotApplicable, label: "Not Applicable" },
    ]
    const onSubmit = (data: FormSchema) => { console.log(data) }

    return (
        <main className="bg-primary-color min-h-screen">
            <div className="flex flex-col items-center mb-12 pt-6">
                <h3 className="text-white-blue pb-3">Create your Account</h3>
                <p className="text-white-blue pb-5">Create an account to sign up for our events and become a BizTech member.</p>
                <span className="flex flex-row items-center">
                    <button className="text-biztech-green underline pr-1">Back to Login Page</button>
                    <Image src={backArrowSvg} alt="Back Arrow"/>
                </span>
            </div>

            <Form {...form}>
            <form className="flex flex-col items-center gap-4 w-fit mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
                {/* University Select */}
                <FormField
                    control={form.control}
                    name="educationLevel"
                    render={({ field }) => (
                        <FormRadio
                            items={uniOptions}
                            title="Please select the option most relevant to you."
                        />
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormInput type='email' title='Email Address*' />
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormInput type='password' title='Password*' />
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormInput type='password' title='Confirm Password*' />
                    )}
                />
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormInput type='text' title='First Name*'/>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormInput type='text' title='Last Name*' name="lastName" />
                    )}
                />
                <FormField
                    control={form.control}
                    name="studentNumber"
                    render={({ field }) => (
                        <FormInput type='text' title='Student Number*'/>
                    )}
                />
                <FormField
                    control={form.control}
                    name="pronouns"
                    render={({ field }) => (
                        <FormMultiSelect 
                            items={pronounOptions}
                            title="Preferred Pronouns"/>
                    )}
                />
                <FormField
                    control={form.control}
                    name="faculty"
                    render={({field}) => (
                        <FormSelect
                            items={facultyOptions}
                            title="Faculty"
                            field={field} />  
                    )}/>
                <FormField
                    control={form.control}
                    name="levelOfStudy"
                    render={({field}) => (
                        <FormSelect
                            items={levelOfStudyOptions}
                            title="Level of Study"
                            field={field} />  
                    )}/>

                <FormField
                    control={form.control}
                    name="major"
                    render={({ field }) => (
                        <FormInput type='text' title='Major'/>
                    )}
                />
                <FormField
                    control={form.control}
                    name="internationalStudent"
                    render={({ field }) => (
                        <FormSelect
                            items={[
                                { value: "true", label: "Yes" },
                                { value: "false", label: "No" },
                            ]}
                            title="Are you an international student?"
                            field={field}
                        />
                    )}
                />
                <FormField
                    control={form.control}
                    name="internationalStudent"
                    render={({ field }) => (
                        <FormSelect
                            items={[
                                { value: "true", label: "Yes" },
                                { value: "false", label: "No" },
                            ]}
                            title="Are you an international student?"
                            field={field}
                        />
                    )}/>
                <FormField
                    control={form.control}
                    name={"biztechPast"}
                    render={({ field }) => (
                        <FormSelect
                            items={[
                                { value: "true", label: "Yes" },
                                { value: "false", label: "No" },
                            ]}
                            title="Have you been involved with BizTech in the past?"
                            field={field}
                        />
                    )}
                />
                <FormField
                    control={form.control}
                    name={"dietaryRestrictions"}
                    render={({ field }) => (
                        <FormSelect
                            items={[
                                { value: dietaryRestrictions.Vegetarian, label: "Vegetarian" },
                                { value: dietaryRestrictions.Vegan, label: "Vegan" },
                                { value: dietaryRestrictions.GlutenFree, label: "Gluten Free" },
                                { value: dietaryRestrictions.Pescetarian, label: "Pescetarian" },
                                { value: dietaryRestrictions.Halal, label: "Halal" },
                                { value: dietaryRestrictions.Kosher, label: "Kosher" },
                                { value: dietaryRestrictions.None, label: "None" },
                            ]}
                            title="Dietary Restrictions"
                            field={field}
                        />
                    )}/>
                <FormField
                    control={form.control}
                    name={"topicsOfInterest"}
                    render={({ field }) => (
                        <FormMultiSelect
                            items={[
                                { value: TopicsOfInterest.CyberSecurity, label: "Cyber Security" },
                                { value: TopicsOfInterest.AI, label: "Artificial Intelligence" },
                                { value: TopicsOfInterest.Startups, label: "Tech Startups" },
                                { value: TopicsOfInterest.eCommerce, label: "eCommerce" },
                                { value: TopicsOfInterest.HealthTech, label: "Health Tech" },
                                { value: TopicsOfInterest.CareersInTech, label: "Careers in the Tech Industry" },
                            ]}
                            title="Topics of Interest"
                        />
                    )}/>
                <FormField
                    control={form.control}
                    name={"howDidYouHearAboutUs"}
                    render={({ field }) => (
                        <FormSelect
                            items={[
                                { value: HowDidYouHearAboutUs.Facebook, label: "Facebook" },
                                { value: HowDidYouHearAboutUs.Instagram, label: "Instagram" },
                                { value: HowDidYouHearAboutUs.LinkedIn, label: "LinkedIn" },
                                { value: HowDidYouHearAboutUs.Boothing, label: "Boothing" },
                                { value: HowDidYouHearAboutUs.FriendsWordOfMouth, label: "Friends/Word of Mouth" },
                                { value: HowDidYouHearAboutUs.BizTechNewsletter, label: "BizTech Newsletter" },
                                { value: HowDidYouHearAboutUs.FacultyNewsletter, label: "Faculty Newsletter" },
                                { value: HowDidYouHearAboutUs.Posters, label: "Posters" },
                                { value: HowDidYouHearAboutUs.Events, label: "Events" },
                                { value: HowDidYouHearAboutUs.Other, label: "Other" },
                            ]}
                            title="How did you hear about us?"
                            field={field}
                        />
                    )}/>
                <button type="submit">Submit</button>
            </form>
        </Form>
        </main>)
}