import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  ClipboardCheck,
  Clock3,
  LoaderCircle,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useAuthStore from "../../auth/authStore";
import api from "../../lib/api/apiClient";
import { extractErrorMessages } from "../../../util/errorUtils";
import TaskForm from "../Task/Taskform";
import DashboardHeader from "./DashboardHeader";

const taskStatistics = [
  {
    label: "Total",
    value: "all",
    valueClassName: "text-foreground",
    indicatorClassName: "text-muted-foreground",
  },
  {
    label: "Pending",
    value: "pending",
    valueClassName: "text-amber-600",
    indicatorClassName: "bg-amber-500",
  },
  {
    label: "In Progress",
    value: "in progress",
    valueClassName: "text-blue-600",
    indicatorClassName: "bg-blue-500",
  },
  {
    label: "Completed",
    value: "completed",
    valueClassName: "text-green-600",
    indicatorClassName: "bg-green-500",
  },
];

const taskFilters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in progress" },
  { label: "Completed", value: "completed" },
];

const taskStatuses = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in progress" },
  { label: "Completed", value: "completed" },
];

const formatDate = (date) => {
  if (!date) return "No due date";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "No due date";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
};

const getStatusStyles = (status) => {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "in progress":
      return "bg-orange-50 text-orange-700";
    case "completed":
      return "bg-green-50 text-green-700";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [actionError, setActionError] = useState("");
  const queryClient = useQueryClient();
  const {
    data: tasks = [],
    error,
    isPending,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await api.get("/tasks");
      if (!Array.isArray(response.data)) {
        throw new Error("The server returned an invalid tasks response.");
      }
      return response.data;
    },
  });

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter((task) => task.status === "pending").length,
    "in progress": tasks.filter(
      (task) => task.status === "in progress",
    ).length,
    completed: tasks.filter((task) => task.status === "completed").length,
  };

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus =
        activeFilter === "all" || task.status === activeFilter;
      const matchesSearch =
        !normalizedSearch ||
        [task.title, task.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));

      return matchesStatus && matchesSearch;
    });
  }, [activeFilter, searchTerm, tasks]);

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }) => {
      const response = await api.put(`/tasks/${taskId}`, { status });
      return response.data;
    },
    onSuccess: () => {
      setActionError("");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (mutationError) => {
      setActionError(extractErrorMessages(mutationError));
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      setActionError("");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (mutationError) => {
      setActionError(extractErrorMessages(mutationError));
    },
  });

  const openCreateForm = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const closeTaskForm = (open) => {
    setIsTaskFormOpen(open);
    if (!open) setEditingTask(null);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <DashboardHeader />
      <section className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card px-4 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s what&apos;s happening with your tasks today.
            </p>
          </div>
          <Button
            type="button"
            onClick={openCreateForm}
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            <Plus aria-hidden="true" />
            Create New Task
          </Button>
        </div>

        {isPending ? (
          <div
            className="mt-6 flex min-h-24 items-center justify-center"
            role="status"
            aria-label="Loading task statistics"
          >
            <LoaderCircle className="animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p
            className="mt-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive"
            role="alert"
          >
            {extractErrorMessages(error)}
          </p>
        ) : (
          <section
            className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Task statistics"
          >
            {taskStatistics.map((statistic) => (
              <article
                key={statistic.label}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm text-muted-foreground">
                    {statistic.label}
                  </h2>
                  {statistic.value === "all" ? (
                    <ClipboardCheck
                      className={`h-4 w-4 ${statistic.indicatorClassName}`}
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      className={`h-2 w-2 rounded-full ${statistic.indicatorClassName}`}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <p
                  className={`mt-1 text-2xl font-bold ${statistic.valueClassName}`}
                >
                  {taskCounts[statistic.value]}
                </p>
              </article>
            ))}
          </section>
        )}

        {!isPending && !error && (
          <section className="mt-6" aria-label="Your tasks">
            <div className="relative max-w-sm">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search tasks..."
                aria-label="Search tasks"
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div
              className="mt-4 grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/40 p-1 sm:grid-cols-4"
              role="group"
              aria-label="Filter tasks by status"
            >
              {taskFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={activeFilter === filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    activeFilter === filter.value
                      ? "bg-background font-medium text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter.label}
                  <span className="text-xs">
                    {filter.value === "all"
                      ? taskCounts.all
                      : taskCounts[filter.value]}
                  </span>
                </button>
              ))}
            </div>

            {actionError && (
              <p
                className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                role="alert"
              >
                {actionError}
              </p>
            )}

            {filteredTasks.length ? (
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredTasks.map((task) => (
                  <article
                    key={task._id}
                    className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="break-words text-base font-semibold">
                        {task.title}
                      </h2>
                      <div className="relative shrink-0">
                        <details className="group">
                          <summary
                            aria-label={`Task actions for ${task.title}`}
                            className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
                          >
                            <MoreVertical
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </summary>
                          <div className="absolute right-0 top-9 z-20 w-48 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg">
                            <label
                              htmlFor={`status-${task._id}`}
                              className="mb-1 block px-2 text-xs font-medium text-muted-foreground"
                            >
                              Change status
                            </label>
                            <select
                              id={`status-${task._id}`}
                              value={task.status}
                              disabled={updateTaskMutation.isPending}
                              onChange={(event) => {
                                updateTaskMutation.mutate({
                                  taskId: task._id,
                                  status: event.target.value,
                                });
                                event.currentTarget.closest("details").open =
                                  false;
                              }}
                              className={`mb-2 w-full cursor-pointer rounded-md px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60 ${getStatusStyles(task.status)}`}
                            >
                              {taskStatuses.map((status) => (
                                <option
                                  key={status.value}
                                  value={status.value}
                                >
                                  {status.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.currentTarget.closest("details").open =
                                  false;
                                openEditForm(task);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                              Edit task
                            </button>
                            <button
                              type="button"
                              disabled={deleteTaskMutation.isPending}
                              onClick={(event) => {
                                event.currentTarget.closest("details").open =
                                  false;
                                if (
                                  window.confirm(`Delete "${task.title}"?`)
                                ) {
                                  deleteTaskMutation.mutate(task._id);
                                }
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                              Delete task
                            </button>
                          </div>
                        </details>
                      </div>
                    </div>

                    <p className="mt-4 min-h-10 whitespace-pre-wrap text-sm text-muted-foreground">
                      {task.description || "No description"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Due: {formatDate(task.dueDate)}
                      </span>
                    </div>

                    <p className="mt-4 inline-flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                      Created: {formatDate(task.createdAt)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                {searchTerm.trim() || activeFilter !== "all"
                  ? "No tasks match your search or filter."
                  : "No tasks yet. Create your first task to get started."}
              </p>
            )}
          </section>
        )}

        {user?.role === "admin" && (
          <Link
            to="/admin"
            className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            Open admin dashboard
          </Link>
        )}
      </section>
      <TaskForm
        task={editingTask}
        open={isTaskFormOpen}
        onOpenChange={closeTaskForm}
      />
    </main>
  );
};

export default DashboardPage;
