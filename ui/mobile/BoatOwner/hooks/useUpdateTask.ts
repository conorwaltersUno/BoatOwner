import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "@/api/fetch/todo.fetch";
import { TaskDTO } from "@/interfaces/todo/todo";
import { QUERYKEYS } from "@/constants/query";
import Constants from "expo-constants";
import { APIPort } from "@/constants/APIPort";

function useUpdateTask() {
  const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV;
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";

  const apiUrl = isLocalDev
    ? "http://" + Constants.expoConfig?.hostUri!.split(":").shift() + `:${APIPort.localPort}`
    : `https://${apiBaseUrl}:${APIPort.localPort}`;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: TaskDTO) => updateTask(apiUrl, task.id, task.status, task.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERYKEYS.TASKS] });
    },
    onError: (error: any) => {
      throw new Error(error?.message || "Failed to update task");
    },
  });
}

export { useUpdateTask };
