import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import api from "../../lib/api/apiClient";
import { extractErrorMessages } from "../../../util/errorUtils";
import useAuthStore from "../../auth/authStore";

const TASK_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const TaskForm = ({ task, open = false, onOpenChange }) => {
  // State for form values
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    status: "pending",
    dueDate: "",
  });
  const [validationError, setValidationError] = useState(null);
  const isEditing = Boolean(task);

  useEffect(() => {
    if (task) {
      setFormValues({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "pending",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      setFormValues({
        title: "",
        description: "",
        status: "pending",
        dueDate: "",
      });
    }
    setValidationError(null);
  }, [task, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationError) setValidationError(null);
  };

  const handleStatusChange = (value) => {
    setFormValues((prev) => ({
      ...prev,
      status: value,
    }));
    if (validationError) setValidationError(null);
  };

  const resetForm = () => {
    setFormValues({
      title: "",
      description: "",
      status: "pending",
      dueDate: "",
    });
    setValidationError(null);
  };

  const handleCancel = () => {
    setValidationError(null);
    onOpenChange?.(false);
  };

  const queryClient = useQueryClient();

  // create task mutation

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const response = await api.post("/tasks", taskData);
      return response.data;
    },
    onSuccess: (data) => {
      // console.log("Task created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      resetForm();
      onOpenChange?.(false);
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      const errorMessage = extractErrorMessages(error);
      setValidationError(errorMessage);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const response = await api.put(`/tasks/${task._id}`, taskData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      resetForm();
      onOpenChange?.(false);
      console.log("Task updated successfully:", data);
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      const errorMessage = extractErrorMessages(error);
      setValidationError(errorMessage);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!useAuthStore.getState().token) {
      setValidationError("No token provided");
      return;
    }

    const trimmedTitle = formValues.title.trim();
    if (!trimmedTitle) {
      setValidationError("Title is required");
      return;
    }

    const dueDateValue = formValues.dueDate
      ? new Date(`${formValues.dueDate}T12:00:00`)
      : null;

    const taskData = {
      title: trimmedTitle,
      description: formValues.description.trim() || "",
      status: formValues.status,
      dueDate: dueDateValue ? dueDateValue.toISOString() : null,
    };

    if (isEditing) {
      updateTaskMutation.mutate(taskData);
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  // Get display error from validation or mutation errors
  const displayError =
    validationError ||
    extractErrorMessages(createTaskMutation.error) ||
    extractErrorMessages(updateTaskMutation.error);

  const isLoading =
    createTaskMutation.isPending || updateTaskMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEditing
              ? "Update the task details below."
              : "Fill in the details below to create a new task."}
          </DialogDescription>
        </DialogHeader>

        {/* inputs */}

        <form onSubmit={handleSubmit} className="space-y-3">
          {displayError && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
              {displayError}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formValues.title}
              onChange={handleInputChange}
              placeholder="Enter task title"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formValues.description}
              onChange={handleInputChange}
              placeholder="Enter task description"
              className="min-h-16 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <select
              value={formValues.status}
              onChange={(event) => handleStatusChange(event.target.value)}
              aria-label="Task status"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {TASK_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="dueDate" className="block text-sm font-medium">
              Due Date
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formValues.dueDate}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader size="sm" />
                  {task ? "Updating..." : "Creating..."}
                </span>
              ) : task ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
