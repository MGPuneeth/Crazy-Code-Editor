import Image from "next/image";
import SignInFormClient from "@/modules/auth/components/sign-in-form-client";
import React from "react";
const Page = () => {
  return (
    <>
      <Image
        src={"/login.svg"}
        alt="Login-Image"
        height={300}
        width={300}
        className="m-6 object-cover"
      ></Image>
      <SignInFormClient />
    </>
  );
};

export default Page;
