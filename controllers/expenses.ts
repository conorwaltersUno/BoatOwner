import { Request, Response } from "express";
import { ExpenseService } from "../services";
import { CreateExpenseDTO, ExpenseDTO, UpdateExpenseDTO } from "../interfaces/expense";
import { param } from "express-validator";

const okStatus = 200;
const createdStatus = 201;
const noContentStatus = 204;
const badRequestStatus = 400;
const notFoundStatus = 404;
const internalServerError = 500;

// Get all expenses
async function getAllExpenses(req: Request, res: Response) {
  try {
    const expenses: ExpenseDTO[] | null = await ExpenseService.getAllExpenses();
    if (!expenses) {
      return res.status(noContentStatus).json({ message: "No Expenses found" });
    }
    return res.status(okStatus).json(expenses);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Get expense by ID
async function getExpenseById(req: Request, res: Response) {
  try {
    const expense: ExpenseDTO | null = await ExpenseService.getExpenseById(Number(req.params.id));

    if (!expense) {
      return res.status(notFoundStatus).json({ message: "Expense not found" });
    }

    return res.status(okStatus).json(expense);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Get expenses by boat ID
async function getExpensesByBoatId(req: Request, res: Response) {
  try {
    const expenses: ExpenseDTO[] = await ExpenseService.getExpensesByBoatId(Number(req.params.boat_id));

    if (expenses.length === 0) {
      return res.status(notFoundStatus).json({ message: "No expenses found for this boat" });
    }

    return res.status(okStatus).json(expenses);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Create a new expense
async function createExpense(req: Request, res: Response) {
  try {
    const expense: CreateExpenseDTO = await ExpenseService.createExpense({
      ...req.body,
      boat_id: Number(req.params.boat_id),
    });

    if (!expense) {
      return res.status(badRequestStatus).json({ message: "Error creating expense, please try again" });
    }

    return res.status(createdStatus).json(expense);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Update an existing expense
async function updateExpense(req: Request, res: Response) {
  try {
    const expense: UpdateExpenseDTO | null = await ExpenseService.updateExpense(Number(req.params.id), req.body);

    if (!expense) {
      return res.status(notFoundStatus).json({ message: "Expense not found" });
    }

    return res.status(okStatus).json(expense);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

// Delete an expense
async function deleteExpense(req: Request, res: Response) {
  try {
    const expenseDeleted = await ExpenseService.deleteExpense(Number(req.params.id));

    if (!expenseDeleted) {
      return res.status(notFoundStatus).json({ message: "Expense not found" });
    }

    return res.sendStatus(noContentStatus);
  } catch (error: any) {
    res.status(internalServerError).json(error.message);
  }
}

export { getAllExpenses, getExpenseById, getExpensesByBoatId, createExpense, updateExpense, deleteExpense };
