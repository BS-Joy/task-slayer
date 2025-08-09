import { SignupForm } from "@/components/signup/login-form";
import Image from "next/image";
import logo from "@/public/logo.png";

const Page = () => {
  return (
    <div className="grid min-h-svh">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex gap-2 font-bold text-xl font-trajan-pro">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Image src={logo} alt="logo" />
            </div>
            Task Slayer
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
