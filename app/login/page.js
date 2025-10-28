import { LoginForm } from "@/components/login/login-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

async function LoginPage() {
  const supaBase = await createClient();
  const { data, error } = await supaBase.auth.getUser();

  // console.log("In login page: ", data);
  if (data?.user?.id) {
    redirect("/");
  }
  return (
    <div className="flex flex-1 items-center justify-center mt-24">
      <div className="w-full max-w-xs">
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
