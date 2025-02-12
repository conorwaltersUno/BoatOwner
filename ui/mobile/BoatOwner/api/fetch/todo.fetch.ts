import { APIRoutes } from "@/constants/APIRoutes";
import { CreateTaskDTO, TaskDTO } from "@/interfaces/todo";

export const fetchTasks = async (apiUrl: string, boatId: number) => {
  try {
    const response = await fetch(`${apiUrl}${APIRoutes.tasks}/boat/${boatId}/tasks`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }
    const data: TaskDTO[] = await response.json();
    return data;
  } catch (err: any) {
    console.log(err);
  }
};

export const postTask = async (apiUrl: string, boatId: number, task: CreateTaskDTO) => {
  try {
    const response = await fetch(`${apiUrl}${APIRoutes.tasks}/${boatId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...task, created_on: new Date().toISOString() }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    const data: TaskDTO = await response.json();
    return data;
  } catch (err: any) {
    console.error("Error creating task:", err.message);
    throw err;
  }
};

export const updateTask = async (apiUrl: string, taskId: number, status: string, description: string) => {
  try {
    const response = await fetch(`${apiUrl}${APIRoutes.tasks}/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: status, description: description }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.statusText}`);
    }

    const data: TaskDTO = await response.json();
    return data;
  } catch (err: any) {
    console.error("Error updating task:", err.message);
    throw err;
  }
};

export const deleteTask = async (apiUrl: string, taskId: number) => {
  try {
    const response = await fetch(`${apiUrl}${APIRoutes.tasks}/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }
  } catch (err: any) {
    console.error("Error creating task:", err.message);
    throw err;
  }
};
