import { useQuery } from "@tanstack/react-query";
import {} from "../constants/query";
import { QUERYKEYS } from "@/constants/query";
import { fetchTasks } from "@/api/fetch/todo.fetch";
import Constants from "expo-constants";
import { APIPort } from "@/constants/APIPort";

function useGetTasks() {
  //get this id from user object when AUTH is implemented
  const boatId = 1;
  const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV;
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";

  const apiUrl = isLocalDev
    ? "http://" + Constants.expoConfig?.hostUri!.split(":").shift() + `:${APIPort.localPort}`
    : `https://${apiBaseUrl}:${APIPort.localPort}`;

  return useQuery({
    queryKey: [QUERYKEYS.TASKS],
    queryFn: () => fetchTasks(apiUrl, boatId),
    staleTime: 10 * 60 * 1000,
  });
}

export { useGetTasks };
