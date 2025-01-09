import { prisma } from "../utilities";
import { ExpenseDTO, CreateExpenseDTO, UpdateExpenseDTO } from "../interfaces/expense";
import dayjs from "dayjs";

async function getAllExpenses(): Promise<ExpenseDTO[]> {
  try {
    return await prisma.expenses.findMany({
      orderBy: {
        id: "asc",
      },
    });
  } catch (error: any) {
    throw Error("Error retrieving expenses: " + error.message);
  }
}

async function getExpenseById(expenseId: number): Promise<ExpenseDTO | null> {
  try {
    return await prisma.expenses.findUnique({
      where: {
        id: expenseId,
      },
    });
  } catch (error: any) {
    throw Error(`No expense found with id: ${expenseId}`);
  }
}

async function getExpensesByBoatId(boatId: number): Promise<ExpenseDTO[]> {
  try {
    return await prisma.expenses.findMany({
      where: {
        boat_id: boatId,
      },
      orderBy: {
        created_on: "desc",
      },
    });
  } catch (error: any) {
    throw Error(`Error retrieving expenses for boat id: ${boatId} - ${error.message}`);
  }
}

async function createExpense(data: CreateExpenseDTO): Promise<ExpenseDTO> {
  try {
    console.log(data);
    const newExpense = await prisma.expenses.create({
      data: {
        boat_id: data.boat_id,
        expense_type: data.expense_type,
        amount: data.amount,
        expense_date: dayjs(data.expense_date).format(),
        created_on: dayjs().format(),
      },
    });

    return newExpense;
  } catch (error: any) {
    throw Error("Error creating expense: " + error.message);
  }
}

async function updateExpense(expenseId: number, data: UpdateExpenseDTO): Promise<ExpenseDTO | null> {
  try {
    const updatedExpense = await prisma.expenses.update({
      where: {
        id: expenseId,
      },
      data: {
        expense_type: data.expense_type,
        amount: data.amount,
        expense_date: dayjs(data.expense_date).format(),
      },
    });

    return updatedExpense;
  } catch (error: any) {
    throw Error(`Error updating expense with id: ${expenseId} - ${error.message}`);
  }
}

async function deleteExpense(expenseId: number): Promise<boolean> {
  try {
    await prisma.expenses.delete({
      where: {
        id: expenseId,
      },
    });

    return true;
  } catch (error: any) {
    throw Error(`Error deleting expense with id: ${expenseId} - ${error.message}`);
  }
}

const ExpenseService = {
  getAllExpenses,
  getExpenseById,
  getExpensesByBoatId,
  createExpense,
  updateExpense,
  deleteExpense,
};

export { ExpenseService };
