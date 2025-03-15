import React, { useState } from "react"
import { useRouter } from "next/router"
import { Amplify } from "aws-amplify"
import { signIn, getCurrentUser } from "@aws-amplify/auth"
import outputs from "../../amplify_outputs.json"
import Link from "next/link"

Amplify.configure(outputs)

const SignUp = () => {
  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center py-8 sm:px-6 lg:px-8 bg-login-page-bg">
      <form className="mx-72 mt-12">
        <div className="space-y-12">
          <div className="border-b border-white/10 pb-12 text-center">
            <h2 className="text-base font-semibold leading-7 text-white">
              Create your account
            </h2>
            <p className="mt-8 text-sm leading-6 text-gray-400">
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
              {/* Select Option */}
              <fieldset className="space-y-6">
                <legend className="text-sm font-semibold leading-6 text-white">
                  Please select the option that&apos;s most relevant to you *
                </legend>
                <div className="flex flex-col gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="student-status"
                      value="ubc"
                      className="form-radio"
                    />
                    <span className="ml-2 text-white">
                      I am a current/prospective UBC student
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="student-status"
                      value="university"
                      className="form-radio"
                    />
                    <span className="ml-2 text-white">
                      I am a current/prospective university student
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="student-status"
                      value="highschool"
                      className="form-radio"
                    />
                    <span className="ml-2 text-white">
                      I am a high school student
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="student-status"
                      value="none"
                      className="form-radio"
                    />
                    <span className="ml-2 text-white">None of the above</span>
                  </label>
                </div>
              </fieldset>

              {/* Email, Password, Confirm Password */}
              <div className="grid grid-cols-1 gap-y-8">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-white"
                  >
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="mt-2 block w-full rounded-md bg-white/5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-white"
                  >
                    Password *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="mt-2 block w-full rounded-md bg-white/5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium leading-6 text-white"
                  >
                    Confirm Password *
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    className="mt-2 block w-full rounded-md bg-white/5 py-1.5 text-white"
                  />
                </div>
              </div>

              {/* First and Last Name */}
              <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium leading-6 text-white"
                  >
                    First Name *
                  </label>
                  <input
                    id="first-name"
                    name="first-name"
                    type="text"
                    className="mt-2 block w-full rounded-md bg-white/5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="last-name"
                    className="block text-sm font-medium leading-6 text-white"
                  >
                    Last Name *
                  </label>
                  <input
                    id="last-name"
                    name="last-name"
                    type="text"
                    className="mt-2 block w-full rounded-md bg-white/5 py-1.5 text-white"
                  />
                </div>
              </div>

              {/* Student Number */}
              <div>
                <label
                  htmlFor="student-number"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Student Number *
                </label>
                <input
                  id="student-number"
                  name="student-number"
                  type="text"
                  className="mt-2 block w-full rounded-md bg-white/5 py-1.5 text-white"
                />
              </div>

              {/* Preferred Pronouns */}
              <fieldset>
                <legend className="block text-sm font-medium leading-6 text-white">
                  Preferred Pronouns *
                </legend>
                <div className="mt-2 flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="pronouns"
                      value="he"
                      className="form-radio"
                    />
                    <span className="ml-2 text-white">He/Him/His</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="pronouns"
                      value="she"
                      className="form-radio"
                    />
                    <span className="ml-2 text-white">She/Her/Hers</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="pronouns"
                      value="they"
                      className="form-radio"
                    />
                    <span className="ml-2 text-white">They/Them/Theirs</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="pronouns"
                      value="other"
                      className="form-radio"
                    />
                    <span className="ml-2 text-white">
                      Other/Prefer not to say
                    </span>
                  </label>
                </div>
              </fieldset>

              {/* Dropdowns */}
              <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="level-of-study"
                    className="block text-sm font-medium leading-6 text-white"
                  >
                    Level of Study *
                  </label>
                  <select
                    id="level-of-study"
                    name="level-of-study"
                    className="mt-2 px-2 block w-full rounded-md bg-white/5 py-1.5 text-white"
                  >
                    <option>Bachelor&apos;s</option>
                    <option>Master&apos;s</option>
                    <option>PhD</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="faculty"
                    className="block text-sm font-medium leading-6 text-white"
                  >
                    Faculty *
                  </label>
                  <select
                    id="faculty"
                    name="faculty"
                    className="mt-2 px-2 block w-full rounded-md bg-white/5 py-1.5 text-white"
                  >
                    <option>Science</option>
                    <option>Engineering</option>
                    <option>Arts</option>
                    <option>Business</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="major"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Major *
                </label>
                <input
                  id="major"
                  name="major"
                  type="text"
                  className="mt-2 block w-full rounded-md bg-white/5 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="international-student"
                    className="block text-sm font-medium leading-6 text-white"
                  >
                    Are you an international student? *
                  </label>
                  <select
                    id="international-student"
                    name="international-student"
                    className="mt-2 px-2 block w-full rounded-md bg-white/5 py-1.5 text-white"
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="dietary-restrictions"
                    className="block text-sm font-medium leading-6 text-white"
                  >
                    Any dietary restrictions?
                  </label>
                  <select
                    id="dietary-restrictions"
                    name="dietary-restrictions"
                    className="mt-2 px-2 block w-full rounded-md bg-white/5 py-1.5 text-white"
                  >
                    <option>None</option>
                    <option>Vegetarian</option>
                    <option>Vegan</option>
                    <option>Gluten-free</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="previous-member"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Were you a BizTech member last year?
                </label>
                <select
                  id="previous-member"
                  name="previous-member"
                  className="mt-2 block w-full rounded-md bg-white/5 py-1.5 text-white"
                >
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>

              {/* Checkboxes for Topics */}
              <fieldset>
                <legend className="block text-sm font-medium leading-6 text-white">
                  What topics do you want to see discussed in future events?
                </legend>
                <div className="mt-4 space-y-2">
                  <div className="flex items-start">
                    <input
                      id="cyber-security"
                      name="topics"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor="cyber-security"
                      className="ml-3 block text-sm leading-6 text-white"
                    >
                      Cyber Security
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      id="ai"
                      name="topics"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor="ai"
                      className="ml-3 block text-sm leading-6 text-white"
                    >
                      AI
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      id="tech-startups"
                      name="topics"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor="tech-startups"
                      className="ml-3 block text-sm leading-6 text-white"
                    >
                      Tech Startups
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      id="ecommerce"
                      name="topics"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor="ecommerce"
                      className="ml-3 block text-sm leading-6 text-white"
                    >
                      eCommerce
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      id="health-tech"
                      name="topics"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor="health-tech"
                      className="ml-3 block text-sm leading-6 text-white"
                    >
                      Health Tech
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      id="careers-tech"
                      name="topics"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor="careers-tech"
                      className="ml-3 block text-sm leading-6 text-white"
                    >
                      Careers in the Tech Industry
                    </label>
                  </div>
                </div>
              </fieldset>

              {/* How did you hear about us */}
              <div>
                <label
                  htmlFor="referral"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  How did you hear about us?
                </label>
                <input
                  id="referral"
                  name="referral"
                  type="text"
                  className="mt-2 block w-full rounded-md bg-white/5 py-1.5 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="submit"
            className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400"
          >
            Proceeed to Payment
          </button>
        </div>
      </form>
    </div>
  )
}

export default SignUp
