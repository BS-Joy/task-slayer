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
        name: formData.get("name"),
      },
    },
  };

  const { data: resData, error } = await supabase.auth.signUp(data);

  console.log(resData);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
  return resData;
}
