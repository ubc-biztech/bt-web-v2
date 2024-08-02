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

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    firstName: z.string(),
    lastName: z.string(),
    studentNumber: z.string().length(8),
    educationLevel: z.nativeEnum(EducationLevel),
    pronouns: z.nativeEnum(Pronouns),
    faculty: z.nativeEnum(Faculty),
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
            <form className="flex flex-col items-center w-fit mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
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

                <button type="submit">Submit</button>
            </form>
        </Form>
        </main>
    )
}