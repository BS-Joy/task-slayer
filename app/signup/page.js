import { SignupForm } from "@/components/signup/signup-form";

const Page = () => {
  return (
    <div className="flex flex-1 items-center justify-center mt-24">
      <div className="w-full max-w-xs">
        <SignupForm />
      </div>
    </div>
  );
};

export default Page;
