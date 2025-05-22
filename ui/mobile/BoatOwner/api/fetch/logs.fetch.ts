import { APIPort } from "@/constants/APIPort";
import { APIRoutes } from "@/constants/APIRoutes";
import Constants from "expo-constants";
import { LogDTO, SaveLogDTO, UpdateLogDTO } from "../../interfaces/log/log";
import { authFetch } from "../../api/fetch/auth.fetch";

const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV;
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";

const apiUrl = isLocalDev
  ? "http://" + Constants.expoConfig?.hostUri!.split(`:`).shift() + `:${APIPort.localPort}`
  : `https://${apiBaseUrl}:${APIPort.localPort}`;

export const postLog = async (log: SaveLogDTO, boatId: number) => {
  try {
    const response = await authFetch(`${apiUrl}${APIRoutes.logs}/${boatId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...log,
        log_started: log.log_started?.toISOString(),
        log_ended: log.log_ended?.toISOString(),
        created_on: log.created_on.toISOString(),
        coordinates: JSON.parse(JSON.stringify(log.coordinates)),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create log: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.error("Error creating log:", err.message);
    throw err;
  }
};

export const updateLog = async (log: UpdateLogDTO) => {
  try {
    const response = await authFetch(`${apiUrl}${APIRoutes.logs}/${log.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(log),
    });

    if (!response.ok) {
      throw new Error(`Failed to update log: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.error("Error updating log:", err.message);
    throw err;
  }
};

export const getLogs = async (boatId: number) => {
  try {
    const response = await authFetch(`${apiUrl}${APIRoutes.logs}/boat/${boatId}`);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      if (response.status === 404 && errorBody.message && errorBody.message.startsWith("No Logs found")) {
        return [];
      }
      throw new Error(errorBody.message || `Failed to fetch logs: ${response.statusText}`);
    }
    const data: LogDTO[] = await response.json();
    return data;
  } catch (err: any) {
    console.error("Error fetching logs:", err.message);
    throw err;
  }
};
