"use server";

import { createClient } from "@/utils/supabase/server";

export const createTask = async (taskData) => {
  const supaBase = await createClient();
  const { data, error } = await supaBase.auth.getUser();

  if (error || !data) {
    return {
      error: {
        message: "User not authenticated",
      },
    };
  }

  const newTask = { ...taskData, user_id: data?.user?.id };

  const res = await supaBase.from("tasks").insert(newTask).select().single();

  return res;
};

export const getAllTasks = async (date) => {
  const supaBase = await createClient();

  const { data, error } = await supaBase.auth.getUser();

  const userID = data?.user?.id;

  if (error || !data) {
    return {
      error: {
        message: "User not authenticated",
      },
    };
  }

  // const res = await supaBase.from("tasks").select("*", {count: "exact"}); // to get count along with data
  const res = await supaBase
    .from("tasks")
    .select()
    .eq("user_id", userID)
    .eq("date", date);

  // console.log(res);

  return res;
};
