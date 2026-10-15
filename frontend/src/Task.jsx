import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

async function createTodo(newTodo) {
  const response = await fetch("http://localhost:3000/api/tasks", {
    // <--- Halkan ka beddel oo ka dhig tasks halkii aad ka dhigi lahayd users
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  });
  if (!response.ok) throw new Error("Failed to create todo");
  return response.json();
}
const Task = () => {
  const [task, settask] = useState("");

  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      console.log("task created");
    },
  });

  const handleAdd = () => {
    mutation.mutate({ title: task });
  };
  return (
    <div>
      <input type="text" onChange={(e) => settask(e.target.value)} />
      <button onClick={handleAdd}>add task</button>
      <Button>Add Task</Button>
    </div>
  );
};

export default Task;
