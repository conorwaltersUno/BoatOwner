import { CreateTaskDTO, TaskDTO } from "@/interfaces/todo";

export const fetchTasks = async (apiUrl: string, boatId: number) => {
  try {
    const response = await fetch(`${apiUrl}/tasks/boat/${boatId}/tasks`);
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
    const response = await fetch(`${apiUrl}/tasks/${boatId}`, {
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

export const deleteTask = async (apiUrl: string, taskId: number) => {
  try {
    const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
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
