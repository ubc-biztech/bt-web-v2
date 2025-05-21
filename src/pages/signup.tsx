import Link from "next/link";
import React from "react";

const options = [
  {
    name: "User + Membership 2023/24 Registration",
    description:
      "I am not a user yet and want to make my account and membership all at once!",
    imageUrl: "https://app.ubcbiztech.com/static/media/house.c7c12f3a.svg",
    ref: "/account-creation",
  },
  {
    name: "Membership 2023/24 Registration",
    description:
      "I am a user already and am here to sign up or renew my membership status!",
    imageUrl: "https://app.ubcbiztech.com/static/media/login.77830c40.svg",
    ref: "/login",
  },
];

const SignUp = () => {
  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center py-8 sm:px-6 lg:px-8 bg-login-page-bg">
      <div className="bg-gray-900 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              UBC BizTech
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-400">
              Please choose the option that is applicable to you.
            </p>
          </div>
          <ul
            role="list"
            className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-8"
          >
            {options.map((option) => (
              <Link key={option.name} href={option.ref} passHref>
                <li className="rounded-2xl border-2 border-gray-600 px-8 py-10 bg-green-500 hover:bg-green-600 hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out">
                  <h3 className="mb-8 text-md font-medium leading-7 tracking-tight text-white">
                    {option.name}
                  </h3>
                  <img
                    alt=""
                    src={option.imageUrl}
                    className="mx-auto h-48 w-48 md:h-56 md:w-56"
                  />
                  <p className="text-sm leading-6 text-gray-200 mt-6 px-6">
                    {option.description}
                  </p>
                </li>
              </Link>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
