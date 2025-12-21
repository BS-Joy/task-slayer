"use client";

import { create } from "zustand";
import { format, parseISO } from "date-fns";
import { getAllTasks } from "@/app/actions/task/taskActions";

// Helper to get tasks from localStorage
const getStoredTasks = () => {
  if (typeof window === "undefined") return {};

  const storedTasks = localStorage.getItem("tasks");
  return storedTasks ? JSON.parse(storedTasks) : {};
};

// Helper to save tasks to localStorage
const saveTasksToStorage = (tasks) => {
  if (typeof window === "undefined") return;

  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// Create the store
export const useTaskStore = create((set, get) => ({
  // Tasks organized by date: { "2023-04-09": [task1, task2, ...], ... }
  tasks: {},
  dbTasks: [],
  fetchLoading: false,

  // Initialize tasks from localStorage
  initializeTasks: () => {
    set({ tasks: getStoredTasks() });
  },

  // Get tasks for a specific date
  getTasksByDate: (date) => {
    const { tasks } = get();
    const queryDateKey =
      typeof date === "string" ? date : format(date, "yyyy-MM-dd");
    const queryDate = parseISO(queryDateKey); // Parse the query date once for comparison

    const relevantTasks = [];

    // 1. Add single tasks for the queryDateKey
    // Filter out repetitive tasks from the direct lookup, as they are handled separately
    if (tasks[queryDateKey]) {
      const singleTasksOnDate = tasks[queryDateKey].filter(
        (task) => !task.isRepetitive
      );
      relevantTasks.push(...singleTasksOnDate);
    }

    // 2. Iterate through ALL stored tasks to find repetitive tasks that apply to queryDateKey
    Object.values(tasks).forEach((dateTasksArray) => {
      dateTasksArray.forEach((task) => {
        if (task.isRepetitive) {
          const startDate = parseISO(task.date); // This is the series start date
          const endDate = task.repetitionEndDate
            ? parseISO(task.repetitionEndDate)
            : null;

          // Check if the queryDate falls within the repetitive task's range
          const isWithinRange =
            queryDate >= startDate && (!endDate || queryDate <= endDate);

          if (isWithinRange) {
            relevantTasks.push({
              ...task,
              date: queryDateKey, // This is the date for which it's being displayed
              originalDate: task.date, // Keep track of the original series start date
            });
          }
        }
      });
    });

    // Remove potential duplicates (though current logic should prevent this for repetitive tasks)
    const uniqueTasks = Array.from(
      new Map(relevantTasks.map((item) => [item.id + item.date, item])).values()
    );

    // Sort by time
    const sortedTasks = uniqueTasks.sort((a, b) => {
      // Tasks without timeStart come first
      const aHasTime = a.timeStart !== null && a.timeStart !== undefined;
      const bHasTime = b.timeStart !== null && b.timeStart !== undefined;

      if (!aHasTime && bHasTime) return -1; // a (no time) comes before b (has time)
      if (aHasTime && !bHasTime) return 1; // b (no time) comes before a (has time)

      // If both have time or both don't have time, sort by timeStart
      return a.timeStart?.localeCompare(b.timeStart || "") || 0;
    });

    return sortedTasks;
  },

  // fetch tasks by dates
  fetchTasksByDate: async () => {
    set({ fetchLoading: true });
    const res = await getAllTasks();
    // console.log("Fetched tasks in store:", res);
    if (res?.data?.length > 0) {
      set({ dbTasks: res?.data, fetchLoading: false });
    }
    return res;
  },

  // Get all overdue tasks (tasks from past dates that are not completed)
  getOverdueTasks: () => {
    const { tasks } = get();
    const today = format(new Date(), "yyyy-MM-dd");
    const overdueTasks = [];

    Object.keys(tasks).forEach((dateKey) => {
      // Only check dates before today
      if (dateKey < today) {
        const dateTasks = tasks[dateKey] || [];

        dateTasks.forEach((task) => {
          // Only include non-repetitive, incomplete tasks
          if (!task.completed && !task.isRepetitive) {
            overdueTasks.push({
              ...task,
              originalDate: task.date,
            });
          }
        });
      }
    });

    // Sort by date (oldest first)
    return overdueTasks.sort((a, b) => {
      return a.date.localeCompare(b.date);
    });
  },

  // Add a new task
  addTask: (task) => {
    set((state) => {
      const dateKey = task.date; // This is the start date for repetitive tasks
      const updatedTasks = { ...state.tasks };

      if (!updatedTasks[dateKey]) {
        updatedTasks[dateKey] = [];
      }

      updatedTasks[dateKey] = [...updatedTasks[dateKey], task]; // Task is stored under its start date

      saveTasksToStorage(updatedTasks);

      return { tasks: updatedTasks };
    });
  },

  // Update an existing task
  updateTask: (updatedTask) => {
    set((state) => {
      const updatedTasks = { ...state.tasks };
      let oldStorageKey = null;
      let taskInStore = null;

      // Find the task's current storage location and the task object itself
      for (const dateKey in updatedTasks) {
        const foundIndex = updatedTasks[dateKey].findIndex(
          (t) => t.id === updatedTask.id
        );
        if (foundIndex !== -1) {
          oldStorageKey = dateKey;
          taskInStore = updatedTasks[dateKey][foundIndex];
          break;
        }
      }

      if (!taskInStore) {
        console.warn("Task not found for update:", updatedTask.id);
        return { tasks: updatedTasks };
      }

      // The new date for the task (which will be its new storage key)
      const newStorageKey = format(updatedTask.date, "yyyy-MM-dd");

      // If the task's storage key has changed
      if (oldStorageKey !== newStorageKey) {
        // Remove from old date key
        updatedTasks[oldStorageKey] = updatedTasks[oldStorageKey].filter(
          (task) => task.id !== updatedTask.id
        );
        if (updatedTasks[oldStorageKey].length === 0) {
          delete updatedTasks[oldStorageKey];
        }

        // Add to new date key
        if (!updatedTasks[newStorageKey]) {
          updatedTasks[newStorageKey] = [];
        }
        updatedTasks[newStorageKey].push({
          ...updatedTask,
          date: newStorageKey, // Ensure the stored date matches the new storage key
          // If it was a repetitive task and is now being moved/converted,
          // its originalDate should reflect its *previous* series start date.
          // If it's still repetitive, its originalDate should be undefined in storage.
          originalDate: updatedTask.isRepetitive ? undefined : oldStorageKey, // Only set originalDate if it's now a single task
          repetitionEndDate:
            updatedTask.isRepetitive && updatedTask.repetitionEndDate
              ? format(updatedTask.repetitionEndDate, "yyyy-MM-dd")
              : undefined, // Format end date if repetitive, clear if not
        });
      } else {
        // Storage key has not changed, update in place
        updatedTasks[newStorageKey] = updatedTasks[newStorageKey].map((task) =>
          task.id === updatedTask.id
            ? {
                ...updatedTask,
                date: newStorageKey, // Ensure the stored date matches the storage key
                originalDate: updatedTask.isRepetitive
                  ? undefined
                  : taskInStore.originalDate, // Preserve originalDate if it was already a single task with one
                repetitionEndDate:
                  updatedTask.isRepetitive && updatedTask.repetitionEndDate
                    ? format(updatedTask.repetitionEndDate, "yyyy-MM-dd")
                    : undefined, // Format end date if repetitive, clear if not
              }
            : task
        );
      }

      saveTasksToStorage(updatedTasks);
      return { tasks: updatedTasks };
    });
  },

  // Reschedule a task to a new date
  rescheduleTask: (taskId, newDate, markAsRescheduled = true) => {
    set((state) => {
      const updatedTasks = { ...state.tasks };
      let taskToReschedule = null;
      let originalDateKey = null; // This will be the date key where the task is currently stored

      // Find the task to reschedule across all date keys
      Object.keys(updatedTasks).forEach((dateKey) => {
        const foundTask = updatedTasks[dateKey].find(
          (task) => task.id === taskId
        );
        if (foundTask) {
          taskToReschedule = { ...foundTask };
          originalDateKey = dateKey;
        }
      });

      if (!taskToReschedule || !originalDateKey) return { tasks: updatedTasks };

      // Format the new date
      const newDateKey =
        typeof newDate === "string" ? newDate : format(newDate, "yyyy-MM-dd");

      // If rescheduling to a different date
      if (originalDateKey !== newDateKey) {
        // Remove the original task completely from the old date
        updatedTasks[originalDateKey] = updatedTasks[originalDateKey].filter(
          (task) => task.id !== taskId
        );

        // Clean up empty date arrays
        if (updatedTasks[originalDateKey].length === 0) {
          delete updatedTasks[originalDateKey];
        }

        // Add to new date
        if (!updatedTasks[newDateKey]) {
          updatedTasks[newDateKey] = [];
        }

        // Update task with new date and rescheduled info
        const rescheduledTask = {
          ...taskToReschedule,
          date: newDateKey, // The new date for the task
          rescheduled: markAsRescheduled ? true : taskToReschedule.rescheduled,
          // If it was a repetitive task, its originalDueDate should be its series start date.
          // If it was a single task, originalDueDate tracks its previous date.
          originalDueDate: markAsRescheduled
            ? taskToReschedule.isRepetitive
              ? taskToReschedule.date
              : originalDateKey
            : taskToReschedule.originalDueDate || originalDateKey,
          // If a repetitive task is rescheduled, it effectively becomes a single task instance
          isRepetitive: false,
          repetitionEndDate: undefined, // Clear repetitive properties
        };

        updatedTasks[newDateKey].push(rescheduledTask);
      }

      // Save to localStorage
      saveTasksToStorage(updatedTasks);

      return { tasks: updatedTasks };
    });
  },

  // Delete a task
  deleteTask: (taskId) => {
    set((state) => {
      const updatedTasks = { ...state.tasks };

      // Find and remove the task from all dates
      Object.keys(updatedTasks).forEach((dateKey) => {
        updatedTasks[dateKey] = updatedTasks[dateKey].filter(
          (task) => task.id !== taskId
        );

        // Remove empty date arrays
        if (updatedTasks[dateKey].length === 0) {
          delete updatedTasks[dateKey];
        }
      });

      // Save to localStorage
      saveTasksToStorage(updatedTasks);

      return { tasks: updatedTasks };
    });
  },
}));
