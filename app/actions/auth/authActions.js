"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(formData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const { data: resData, error } = await supabase.auth.signInWithPassword(data);

  // console.log(error);

  if (error) {
    return {
      message: error?.message,
      status: error?.status,
      isAuthError: true,
    };
  }

  return resData;

  // revalidatePath("/", "layout");
  // redirect("/");
}

export async function signup(formData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
    options: {
      data: {
        full_name: formData.get("full_name"),
      },
    },
  };

  const { data: resData, error } = await supabase.auth.signUp(data);

  // console.log(resData);
  // console.log(error?.message);

  if (error) {
    return {
      message: error?.message,
      status: error?.status,
      isAuthError: true,
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
  // return resData;
}

export async function googleLogin() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: process.env.NEXT_PUBLIC_BASE_URL + "/auth/callback",
    },
  });

  console.log(data);

  if (data?.url) {
    redirect(data?.url);
  }

  if (error) {
    return {
      message: error?.message,
      status: error?.status,
      isAuthError: true,
    };
  }

  return data;
}
