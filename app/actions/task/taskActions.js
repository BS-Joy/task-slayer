"use server";

import { checkAuth } from "../auth/authActions";

export const createTask = async (taskData) => {
  const { user, supaBase, error } = await checkAuth();

  if (error) return { error };

  const userID = user?.id;

  const newTask = { ...taskData, user_id: userID };

  const res = await supaBase.from("tasks").insert(newTask).select().single();

  return res;
};

export const getAllTasks = async (date) => {
  try {
    const { user, supaBase, error } = await checkAuth();

    if (error) return { error };

    const userID = user?.id;

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
    const { user, supaBase, error } = await checkAuth();

    if (error) return { error };

    const userID = user?.id;

    let res;

    if (task.isRepetitive) {
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
    const { user, supaBase, error } = await checkAuth();

    if (error) return { error };

    const userID = user?.id;

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
    const { user, supaBase, error } = await checkAuth();

    if (error) return { error };

    const userID = user?.id;

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

// reschedule a task
export const rescheduleTask = async (task, newDate) => {
  try {
    const { user, supaBase, error } = await checkAuth();

    if (error) return { error };

    const userID = user?.id;

    const res = await supaBase
      .from("tasks")
      .update({ date: newDate })
      .eq("id", task?.id)
      .eq("user_id", userID)
      .select()
      .single();

    return res;
  } catch (err) {
    console.log(err);
    return {
      error: {
        message: "Server error!",
      },
    };
  }
};
