"use client"

import React from 'react';
import { useForm } from "react-hook-form"
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from "next/image";

import { FormInput, FormRadio } from './FormInput'
import backArrowSvg from '../../../public/assets/icons/back_icon.svg';
import {
    Form,
    FormField,
} from "@/components/ui/form"

const EducationLevel = {
    HighSchool: "High School",
    University: "University",
    UBC: "UBC",
    NoneAbove: "NoneAbove"
} as const;

type EducationLevelType = typeof EducationLevel[keyof typeof EducationLevel];

const educationLevels = z.nativeEnum(EducationLevel);

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    firstName: z.string(),
    lastName: z.string(),
    studentNumber: z.string().length(8),
    educationLevel: educationLevels,
})

type FormSchema = z.infer<typeof schema>;

export default function SignUp() {
    const form = useForm<FormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: "",
        },
    })

    const uniOptions: { value: EducationLevelType; label: string }[] = [
        { value: EducationLevel.HighSchool, label: "I am a high school student" },
        { value: EducationLevel.University, label: "I am a current/prospective university student" },
        { value: EducationLevel.UBC, label: "I am a current/prospective UBC student" },
        { value: EducationLevel.NoneAbove, label: "None of the above" },
    ]

    const onSubmit = (data: FormSchema) => { console.log(data) }

    return (
        <main className="bg-primary-color min-h-screen">
            <div className="flex flex-col items-center mb-12">
                <h3 className="text-white-blue pb-3">Create your Account</h3>
                <p className="text-white-blue pb-5">Create an account to sign up for our events and become a BizTech member.</p>
                <span className="flex flex-row items-center">
                    <button className="text-biztech-green underline pr-1">Back to Login Page</button>
                    <Image src={backArrowSvg} alt="Back Arrow"/>
                </span>
            </div>

            <Form {...form}>
                <form className = "flex flex-col items-center w-full"onSubmit={form.handleSubmit(onSubmit)}>
                    {/* University Select */}
                    <FormField
                            control={form.control}
                            name="educationLevel"
                            render={({ field }) => (
                                <FormRadio
                                    options={uniOptions}
                                    title="Please select the option most relevant to you."
                                    onChange={(value: EducationLevelType) => field.onChange(value)}
                                    value={field.value}
                                    enumType={EducationLevel}
                                />
                            )}
                        /> 


                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormInput type='email' title='Email Address' {...field} />
                        )}
                        />
                    {/* Add other form fields here */}
                    <button type="submit">Submit</button>
                </form>
            </Form>
        </main>
    )
}