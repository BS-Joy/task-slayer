import { format } from "date-fns";

export const formatDate = (date) => {
  return format(date, "yyyy-MM-dd");
};

export const getPriorityColor = (priority, isDark) => {
  switch (priority) {
    case "high":
      return isDark
        ? "bg-red-700 hover:bg-red-600"
        : "bg-red-500 hover:bg-red-600";
    case "medium":
      return isDark
        ? "bg-yellow-600 hover:bg-yellow-500"
        : "bg-yellow-500 hover:bg-yellow-600";
    case "low":
      return isDark
        ? "bg-green-700 hover:bg-green-600"
        : "bg-green-500 hover:bg-green-600";
    default:
      return isDark
        ? "bg-slate-700 hover:bg-slate-600"
        : "bg-slate-500 hover:bg-slate-600";
  }
};
