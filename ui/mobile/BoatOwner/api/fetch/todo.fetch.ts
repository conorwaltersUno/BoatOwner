import { APIPort } from "@/constants/APIPort";
import { APIRoutes } from "@/constants/APIRoutes";
import { CreateTaskDTO, TaskDTO } from "@/interfaces/todo/todo";
import Constants from "expo-constants";

const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV;
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";

const apiUrl = isLocalDev
  ? "http://" + Constants.expoConfig?.hostUri!.split(`:`).shift() + `:${APIPort.localPort}`
  : `https://${apiBaseUrl}:${APIPort.localPort}`;

export const fetchTasks = async (boatId: number) => {
  try {
    const response = await fetch(`${apiUrl}${APIRoutes.tasks}/boat/${boatId}/tasks`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }
    const data: TaskDTO[] = await response.json();
    return data;
  } catch (err: any) {
    console.error("Error fetchings tasks:", err.message);
    throw err;
  }
};

export const postTask = async (boatId: number, task: CreateTaskDTO) => {
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

export const updateTask = async (taskId: number, status: string, description: string) => {
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

export const deleteTask = async (taskId: number) => {
  try {
    const response = await fetch(`${apiUrl}${APIRoutes.tasks}/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`);
    }
  } catch (err: any) {
    console.error("Error deletings task:", err.message);
    throw err;
  }
};
