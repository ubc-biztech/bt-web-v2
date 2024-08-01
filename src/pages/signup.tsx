import React, { useState } from 'react';
import { useRouter } from 'next/router';
import SignUpForm from "@/components/SignupForm/form";

//Create SignUp Page
export default function SignUp() {
    return(
        <main className="bg-primary-color min-h-screen">
            <SignUpForm></SignUpForm>
        </main>



    )
}

