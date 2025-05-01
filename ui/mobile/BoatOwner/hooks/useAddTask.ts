import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTaskDTO } from "@/interfaces/todo/todo";
import { postTask } from "@/api/fetch/todo.fetch";
import { QUERYKEYS } from "@/constants/query";
import Constants from "expo-constants";
import { APIPort } from "@/constants/APIPort";

function useAddTask() {
  //get this id from user object when AUTH is implemented
  const boatId = 1;
  const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV;
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";

  const apiUrl = isLocalDev
    ? "http://" + Constants.expoConfig?.hostUri!.split(":").shift() + `:${APIPort.localPort}`
    : `https://${apiBaseUrl}:${APIPort.localPort}`;

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTask: CreateTaskDTO) => postTask(apiUrl, boatId, newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERYKEYS.TASKS] });
    },
    onError: (error: any) => {
      throw new Error(error?.message || "Failed to add task");
    },
  });
}

export { useAddTask };
