import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERYKEYS } from "@/constants/query";
import { ExpenseDTO, UpdateExpenseDTO } from "../interfaces/expenses/expense";
import { updateExpense } from "@/api/fetch/expenses.fetch";
import { SaveLogDTO } from "../interfaces/log/log";
import Constants from "expo-constants";
import { APIPort } from "@/constants/APIPort";
import { postLog } from "@/api/fetch/logs.fetch";

function useSaveLog() {
  const queryClient = useQueryClient();
  //get this id from user object when AUTH is implemented
  const boatId = 1;
  const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV;
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";

  const apiUrl = isLocalDev
    ? "http://" + Constants.expoConfig?.hostUri!.split(":").shift() + `:${APIPort.localPort}`
    : `https://${apiBaseUrl}:${APIPort.localPort}`;

  return useMutation({
    mutationFn: (newLog: SaveLogDTO) => postLog(newLog, apiUrl, boatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERYKEYS.LOGS] });
    },
    onError: (error: any) => {
      throw new Error(error?.message || "Failed to add log");
    },
  });
}

export { useSaveLog };
