"use server";

import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";

export const createTask = async (taskData) => {
  console.log("task Data: ", taskData);
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

export const updateTaskCompletion = async (
  task,
  status,
  taskCompletionDate,
) => {
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

    let res;

    if (task.isRepetitive) {
      // const today = format(new Date(), "yyyy-MM-dd");

      if (!task.completedOn.includes(taskCompletionDate)) {
        task.completedOn.push(taskCompletionDate);
      } else {
        task.completedOn = task.completedOn.filter(
          (date) => date !== taskCompletionDate,
        );
      }

      console.log(task);

      res = await supaBase
        .from("tasks")
        .update({ completedOn: task.completedOn })
        .eq("id", task?.id)
        .select()
        .single();
    } else {
      res = await supaBase
        .from("tasks")
        .update({ completed: !status })
        .eq("id", task?.id)
        .select()
        .single();
    }

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

export const updateTaskInDB = async (task) => {
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

    // console.log("UserId: ", userID);
    // console.log("Task to update: ", task);

    const res = await supaBase
      .from("tasks")
      .update({ ...task })
      .eq("id", task?.id)
      .eq("user_id", userID)
      .select()
      .single();

    return res;
  } catch (error) {
    console.log(error);
  }
};
