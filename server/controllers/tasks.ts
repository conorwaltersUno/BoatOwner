import { Request, Response } from "express";
import { TaskService } from "../services";
import { CreateTaskDTO, TaskDTO, UpdateTaskDTO } from "../interfaces/task";

const okStatus = 200;
const createdStatus = 201;
const noContentStatus = 204;
const badRequestStatus = 400;
const notFoundStatus = 404;
const internalServerError = 500;

// Get all tasks
async function getAllTasks(req: Request, res: Response) {
  try {
    const tasks: TaskDTO[] | null = await TaskService.getAllTasks();

    if (!tasks || tasks.length == 0) {
      return res.status(noContentStatus).json({ message: "Task not found" });
    }

    return res.status(okStatus).json(tasks);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Get task by ID
async function getTaskById(req: Request, res: Response) {
  try {
    const task: TaskDTO | null = await TaskService.getTaskById(Number(req.params.id));

    if (!task) {
      return res.status(notFoundStatus).json({ message: "Task not found" });
    }

    return res.status(okStatus).json(task);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Get tasks by boat ID
async function getTasksByBoatId(req: Request, res: Response) {
  try {
    const tasks: TaskDTO[] = await TaskService.getTasksByBoatId(Number(req.params.boat_id));

    if (tasks.length === 0) {
      return res.status(notFoundStatus).json({ message: "No tasks found for this boat" });
    }

    return res.status(okStatus).json(tasks);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Create a new task
async function createTask(req: Request, res: Response) {
  try {
    const task: CreateTaskDTO = await TaskService.createTask({
      ...req.body,
      boat_id: Number(req.params.boat_id),
    });

    if (!task) {
      return res.status(badRequestStatus).json({ message: "Error creating task, please try again" });
    }

    return res.status(createdStatus).json(task);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Update an existing task
async function updateTask(req: Request, res: Response) {
  try {
    const task: UpdateTaskDTO | null = await TaskService.updateTask(Number(req.params.id), req.body);

    if (!task) {
      return res.status(notFoundStatus).json({ message: "Task not found" });
    }

    return res.status(okStatus).json(task);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Delete a task
async function deleteTask(req: Request, res: Response) {
  try {
    const taskDeleted = await TaskService.deleteTask(Number(req.params.id));

    if (!taskDeleted) {
      return res.status(notFoundStatus).json({ message: "Task not found" });
    }

    return res.sendStatus(noContentStatus);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

export { getAllTasks, getTaskById, getTasksByBoatId, createTask, updateTask, deleteTask };
