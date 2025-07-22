import { APIPort } from "@/constants/APIPort";
import { APIRoutes } from "@/constants/APIRoutes";
import { CreateTaskDTO, TaskDTO } from "@/interfaces/todo/todo";
import Constants from "expo-constants";
import { authFetch } from "../../api/fetch/auth.fetch";

const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV === 'true';
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";

const apiUrl = isLocalDev
  ? "http://" + Constants.expoConfig?.hostUri!.split(`:`).shift() + `:${APIPort.localPort}`
  : apiBaseUrl;

export const fetchTasks = async (boatId: number) => {
  const response = await authFetch(`${apiUrl}${APIRoutes.tasks}/boat/${boatId}/tasks`);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    if (response.status === 404 && errorBody.message && errorBody.message.startsWith("No tasks found")) {
      return [];
    }
    throw new Error(errorBody.message || `Failed to fetch tasks: ${response.statusText}`);
  }
  const data: TaskDTO[] = await response.json();
  return data;
};

export const postTask = async (boatId: number, task: CreateTaskDTO) => {
  const response = await authFetch(`${apiUrl}${APIRoutes.tasks}/${boatId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...task, created_on: new Date().toISOString() }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.statusText}`);
  }
  const data: TaskDTO = await response.json();
  return data;
};

export const updateTask = async (taskId: number, status: string, description: string) => {
  const response = await authFetch(`${apiUrl}${APIRoutes.tasks}/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: status, description: description }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update task: ${response.statusText}`);
  }
  const data: TaskDTO = await response.json();
  return data;
};

export const deleteTask = async (taskId: number) => {
  const response = await authFetch(`${apiUrl}${APIRoutes.tasks}/${taskId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Failed to delete task: ${response.statusText}`);
  }
};
