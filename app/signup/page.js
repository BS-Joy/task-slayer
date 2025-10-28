import { SignupForm } from "@/components/signup/signup-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const SignupPage = async () => {
  const supaBase = await createClient();

  const { data, error } = await supaBase.auth.getUser();

  if (data?.user?.id) {
    redirect("/");
  }
  return (
    <div className="flex flex-1 items-center justify-center mt-24">
      <div className="w-full max-w-xs">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
