import Router, { RequestHandler } from "express";
import {
  getAllExpenses,
  getExpenseById,
  getExpensesByBoatId,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../controllers";
import { validator } from "../middleware/expressValidator";
import { body, param } from "express-validator";
import { auth } from "../middleware/auth";

const ExpenseRouter = Router();

// Get all expenses
ExpenseRouter.route("/").get(
  /*
      #swagger.tags = ['Expense']
      #swagger.summary = 'Get all expenses'
      #swagger.responses[200] = {
        description: 'Successfully retrieved list of expenses',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/getAllExpensesResponse' }
          }
        }
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  auth,
  (async (req, res) => {
    await getAllExpenses(req, res);
  }) as RequestHandler
);

// Get expense by ID
ExpenseRouter.route("/:id").get(
  /*
      #swagger.tags = ['Expense']
      #swagger.summary = 'Get expense by ID'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Expense ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[200] = {
        description: 'Successfully retrieved expense data',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/getExpenseByIdResponse' }
          }
        }
      }
      #swagger.responses[404] = {
        description: "Expense not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  auth,
  [param("id").isInt().withMessage("ID must be an integer")],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await getExpenseById(req, res);
  }) as RequestHandler
);

// Get expenses by boat ID
ExpenseRouter.route("/boat/:boat_id/expenses").get(
  /*
      #swagger.tags = ['Expense']
      #swagger.summary = 'Get expenses by boat ID'
      #swagger.parameters['boat_id'] = {
        in: 'path',
        required: true,
        description: 'Boat ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[200] = {
        description: 'Successfully retrieved expenses for the boat',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/getExpensesByBoatIdResponse' }
          }
        }
      }
      #swagger.responses[404] = {
        description: "Boat not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  auth,
  [param("boat_id").isInt().withMessage("Boat ID must be an integer")],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await getExpensesByBoatId(req, res);
  }) as RequestHandler
);

// Create a new expense
ExpenseRouter.route("/:boat_id").post(
  /*
      #swagger.tags = ['Expense']
      #swagger.summary = 'Create a new expense'
      #swagger.parameters['boat_id'] = {
        in: 'path',
        required: true,
        description: 'Boat ID',
        schema: { type: 'integer' }
      }
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/createExpenseDTO' }
          }
        }
      }
      #swagger.responses[201] = {
        description: 'Expense created successfully',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/createExpenseResponse' }
          }
        }
      }
      #swagger.responses[400] = {
        description: "Invalid input data"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  auth,
  [
    param("boat_id").isInt().withMessage("Boat ID must be an integer"),
    body("expense_type").exists().isString().notEmpty().withMessage("Expense type is required"),
    body("amount").exists().isFloat({ gt: 0 }).withMessage("Amount is required and must be greater than zero"),
    body("expense_date")
      .exists()
      .isISO8601()
      .toDate()
      .withMessage("Expense date is required and must be a valid ISO8601 date"),
  ],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await createExpense(req, res);
  }) as RequestHandler
);

// Update an existing expense
ExpenseRouter.route("/:id").put(
  /*
      #swagger.tags = ['Expense']
      #swagger.summary = 'Update an existing expense'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Expense ID',
        schema: { type: 'integer' }
      }
      #swagger.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/updateExpenseDTO' }
          }
        }
      }
      #swagger.responses[200] = {
        description: 'Expense updated successfully',
        content: {
          "application/json": {
            schema: { $ref: '#/definitions/updateExpenseResponse' }
          }
        }
      }
      #swagger.responses[400] = {
        description: "Invalid input data"
      }
      #swagger.responses[404] = {
        description: "Expense not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  auth,
  [
    param("id").isInt().withMessage("ID must be an integer"),
    body("boat_id").isInt().withMessage("Boat ID must be an integer"),
    body("expense_type").optional().isString().notEmpty().withMessage("Expense type cannot be empty"),
    body("amount").optional().isFloat({ gt: 0 }).withMessage("Amount must be greater than zero"),
  ],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await updateExpense(req, res);
  }) as RequestHandler
);

// Delete an expense
ExpenseRouter.route("/:id").delete(
  /*
      #swagger.tags = ['Expense']
      #swagger.summary = 'Delete an expense'
      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        description: 'Expense ID',
        schema: { type: 'integer' }
      }
      #swagger.responses[204] = {
        description: 'Expense deleted successfully'
      }
      #swagger.responses[404] = {
        description: "Expense not found"
      }
      #swagger.responses[500] = {
        description: "Internal server error"
      }
    */
  auth,
  [param("id").isInt().withMessage("ID must be an integer")],
  (req, res, next) => {
    validator(req, res, next);
  },
  (async (req, res) => {
    await deleteExpense(req, res);
  }) as RequestHandler
);

export { ExpenseRouter };
