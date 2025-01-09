import { prisma } from "../utilities";
import { TaskDTO, CreateTaskDTO, UpdateTaskDTO } from "../interfaces/task";
import dayjs from "dayjs";

async function getAllTasks(): Promise<TaskDTO[]> {
  try {
    return await prisma.tasks.findMany({
      orderBy: {
        id: "asc",
      },
    });
  } catch (error: any) {
    throw Error("Error retrieving tasks: " + error.message);
  }
}

async function getTaskById(taskId: number): Promise<TaskDTO | null> {
  try {
    return await prisma.tasks.findUnique({
      where: {
        id: taskId,
      },
    });
  } catch (error: any) {
    throw Error(`No task found with id: ${taskId}`);
  }
}

async function getTasksByBoatId(boatId: number): Promise<TaskDTO[]> {
  try {
    return await prisma.tasks.findMany({
      where: {
        boat_id: boatId,
      },
      orderBy: {
        created_on: "desc",
      },
    });
  } catch (error: any) {
    throw Error(`Error retrieving tasks for boat id: ${boatId} - ${error.message}`);
  }
}

async function createTask(data: CreateTaskDTO): Promise<TaskDTO> {
  try {
    const newTask = await prisma.tasks.create({
      data: {
        boat_id: data.boat_id,
        description: data.description,
        status: data.status,
        created_on: dayjs(data.created_on).format(),
      },
    });

    return newTask;
  } catch (error: any) {
    throw Error("Error creating task: " + error.message);
  }
}

async function updateTask(taskId: number, data: UpdateTaskDTO): Promise<TaskDTO | null> {
  try {
    const updatedTask = await prisma.tasks.update({
      where: {
        id: taskId,
      },
      data: {
        description: data.description,
        status: data.status,
      },
    });

    return updatedTask;
  } catch (error: any) {
    throw Error(`Error updating task with id: ${taskId} - ${error.message}`);
  }
}

async function deleteTask(taskId: number): Promise<boolean> {
  try {
    await prisma.tasks.delete({
      where: {
        id: taskId,
      },
    });

    return true;
  } catch (error: any) {
    throw Error(`Error deleting task with id: ${taskId} - ${error.message}`);
  }
}

const TaskService = {
  getAllTasks,
  getTaskById,
  getTasksByBoatId,
  createTask,
  updateTask,
  deleteTask,
};

export { TaskService };
