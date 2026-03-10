"use client";

import { create } from "zustand";
import { format, parseISO } from "date-fns";
import { getAllTasks } from "@/app/actions/task/taskActions";
import { formatDate } from "@/utils";

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

  // fetch tasks by dates
  fetchTasksByDate: async (date) => {
    const today = formatDate(new Date());
    const formattedDate = formatDate(date);
    set({ fetchLoading: true });
    const res = await getAllTasks(formattedDate || today);

    // console.log("Fetched tasks in store:", res);

    if (res?.error) {
      console.log(res.error);
      set({ fetchLoading: false });
      return;
    }

    if (res?.status === 200 && res?.data) {
      set({ dbTasks: res?.data, fetchLoading: false });
    }

    set({ fetchLoading: false });
    // return res?.data || [];
  },

  // Get all overdue tasks (tasks from past dates that are not completed)
  getOverdueTasks: () => {
    const { tasks } = get();
    const today = formatDate(new Date());
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
  addTask: (newTask) => {
    set((state) => ({ dbTasks: [...state.dbTasks, newTask] }));
  },

  // Update an existing task
  updateTask: (updatedTask) => {
    set((state) => {
      const updatedTasks = [...state.dbTasks];
      updatedTasks.forEach((task, index) => {
        if (task?.id === updatedTask?.id) {
          updatedTasks[index] = { ...task, ...updatedTask };
        }
      });
      return { dbTasks: updatedTasks };
    });
  },

  // reschedule task from state
  rescheduleTaskFromState: () => {},

  // Delete a task
  deleteStateTask: (taskId) => {
    set((state) => {
      const allTasks = state.dbTasks;

      const updatedTasks = allTasks.filter((task) => task.id !== taskId);

      return { dbTasks: updatedTasks };
    });
  },
}));
