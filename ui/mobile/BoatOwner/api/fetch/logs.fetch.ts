import { APIRoutes } from "@/constants/APIRoutes";
import { SaveLogDTO } from "../../interfaces/log/log";

export const postLog = async (log: SaveLogDTO, apiUrl: string, boatId: number) => {
  try {
    const response = await fetch(`${apiUrl}${APIRoutes.logs}/${boatId}`, {
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
    console.error("Error creating task:", err.message);
    throw err;
  }
};
