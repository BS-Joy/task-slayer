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
  try {
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
      .or(
        `date.eq.${date},and(isRepetitive.eq.true,date.lte.${date},repetitionEndDate.gte.${date})`,
      );
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const updateTaskCompletion = async (task, status) => {
  try {
    const supaBase = await createClient();

    const res = await supaBase
      .from("tasks")
      .update({ completed: !status })
      .eq("id", task?.id)
      .select()
      .single();

    if (res?.error) {
      console.log(res.error);
      return res.error;
    }

    return res;
  } catch (error) {
    console.log(error);
  }
};

export const deleteTask = async (taskId) => {
  try {
    const supaBase = await createClient();

    const { data, error } = await supaBase.auth.getUser();

    if (error || !data) {
      return {
        error: {
          message: "User not authenticated",
        },
      };
    }

    const userID = data?.user?.id;

    const res = await supaBase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", userID)
      .select()
      .single();

    return res;
  } catch (error) {
    console.log(error);
  }
};
