import httpMocks, { createResponse, MockResponse } from "node-mocks-http";
import { Response } from "express";
import { when } from "jest-when";
import { ExpenseService } from "../../services/expenses";
import {
  getAllExpenses,
  getExpenseById,
  getExpensesByBoatId,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../expenses";
import { StatusCodes } from "http-status-codes";
import { CreateExpenseDTO, UpdateExpenseDTO } from "../../interfaces/expense";
import { MockExpenseArray, MockExpenseCreate } from "../../test-utils/test-data/expenses";

jest.mock("../../services/expenses");
jest.mock("@prisma/client");

describe("ExpenseController", () => {
  describe("getAllExpenses", () => {
    it("should return a list of expenses", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/expense/",
      });
      const response: MockResponse<Response> = createResponse();
      const returnValue = MockExpenseArray;

      when(ExpenseService.getAllExpenses).calledWith().mockReturnValueOnce(Promise.resolve(returnValue));
      await getAllExpenses(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.OK);

      const responseData = response._getJSONData().map((expense: any) => ({
        ...expense,
        expense_date: new Date(expense.expense_date).toISOString(),
        created_on: new Date(expense.created_on).toISOString(),
      }));

      const expectedData = MockExpenseArray.map((expense) => ({
        ...expense,
        expense_date: new Date(expense.expense_date).toISOString(),
        created_on: new Date(expense.created_on).toISOString(),
      }));

      expect(responseData).toEqual(expectedData);
    });

    it("should return a 204 status when no expenses are found", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/expense/",
      });
      const response: MockResponse<Response> = createResponse();

      when(ExpenseService.getAllExpenses).calledWith().mockReturnValueOnce(Promise.resolve(null));
      await getAllExpenses(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.NO_CONTENT);
      expect(response._getJSONData()).toEqual({ message: "No Expenses found" });
    });

    it("should return a 500 error when an exception is thrown", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/expense/",
      });
      const response: MockResponse<Response> = createResponse();

      when(ExpenseService.getAllExpenses).calledWith().mockRejectedValueOnce(new Error("Test error"));
      await getAllExpenses(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response._getJSONData()).toEqual("Test error");
    });
  });

  describe("getExpenseById", () => {
    it("should return an expense by id", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/expense/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();
      const returnValue = MockExpenseCreate;

      when(ExpenseService.getExpenseById).calledWith(1).mockReturnValueOnce(Promise.resolve(returnValue));
      await getExpenseById(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.OK);

      const responseData = response._getJSONData();
      const formattedResponseData = {
        ...responseData,
        expense_date: new Date(responseData.expense_date).toISOString(),
        created_on: new Date(responseData.created_on).toISOString(),
      };

      const expectedData = {
        ...MockExpenseCreate,
        expense_date: new Date(MockExpenseCreate.expense_date).toISOString(),
        created_on: new Date(MockExpenseCreate.created_on).toISOString(),
      };

      expect(formattedResponseData).toEqual(expectedData);
    });

    it("should return a 404 error when expense is not found", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/expense/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(ExpenseService.getExpenseById).calledWith(1).mockReturnValueOnce(Promise.resolve(null));
      await getExpenseById(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.NOT_FOUND);
      expect(response._getJSONData()).toEqual({ message: "Expense not found" });
    });

    it("should return a 500 error when an exception is thrown", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/expense/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(ExpenseService.getExpenseById).calledWith(1).mockRejectedValueOnce(new Error("Test error"));
      await getExpenseById(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response._getJSONData()).toEqual("Test error");
    });
  });

  describe("getExpensesByBoatId", () => {
    it("should return expenses for a specific boat", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/expense/boat/1/expenses",
        params: { boat_id: "1" },
      });
      const response: MockResponse<Response> = createResponse();
      const returnValue = MockExpenseArray;

      when(ExpenseService.getExpensesByBoatId).calledWith(1).mockReturnValueOnce(Promise.resolve(returnValue));
      await getExpensesByBoatId(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.OK);

      const responseData = response._getJSONData();
      const formattedResponseData = responseData.map((expense: any) => ({
        ...expense,
        expense_date: new Date(expense.expense_date).toISOString(),
        created_on: new Date(expense.created_on).toISOString(),
      }));

      const expectedData = MockExpenseArray.map((expense) => ({
        ...expense,
        expense_date: new Date(expense.expense_date).toISOString(),
        created_on: new Date(expense.created_on).toISOString(),
      }));

      expect(formattedResponseData).toEqual(expectedData);
    });


    it("should return a 404 error when no expenses are found for the boat", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/expense/boat/1/expenses",
        params: { boat_id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(ExpenseService.getExpensesByBoatId).calledWith(1).mockReturnValueOnce(Promise.resolve([]));
      await getExpensesByBoatId(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.NOT_FOUND);
      expect(response._getJSONData()).toEqual({ message: "No expenses found for this boat" });
    });

    it("should return a 500 error when an exception is thrown", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/expense/boat/1/expenses",
        params: { boat_id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(ExpenseService.getExpensesByBoatId).calledWith(1).mockRejectedValueOnce(new Error("Test error"));
      await getExpensesByBoatId(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response._getJSONData()).toEqual("Test error");
    });
  });

  describe("createExpense", () => {
    it("should return a created expense", async () => {
      const body: CreateExpenseDTO = {
        expense_type: "Fuel",
        amount: 100,
        boat_id: 1,
        expense_date: new Date("2024-07-02T11:00:00.000Z"),
        created_on: new Date("2024-07-02T11:00:00.000Z"),
      };
      const request = httpMocks.createRequest({
        method: "POST",
        url: "/expense/1",
        params: { boat_id: "1" },
        body: body,
      });
      const response: MockResponse<Response> = createResponse();
      const returnValue = { ...body, id: 1 };

      when(ExpenseService.createExpense)
        .calledWith({ ...body, boat_id: 1 })
        .mockReturnValueOnce(Promise.resolve(returnValue));
      await createExpense(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.CREATED);

      const responseData = response._getJSONData();
      const formattedResponseData = {
        ...responseData,
        expense_date: new Date(responseData.expense_date).toISOString(),
        created_on: new Date(responseData.created_on).toISOString(),
      };

      const expectedData = {
        ...returnValue,
        expense_date: new Date(returnValue.expense_date).toISOString(),
        created_on: new Date(returnValue.created_on).toISOString(),
      };

      expect(formattedResponseData).toEqual(expectedData);
    });


    it("should return a 400 error if expense creation fails", async () => {
      const body: CreateExpenseDTO = {
        expense_type: "Fuel",
        amount: 100,
        boat_id: 1,
        expense_date: new Date("2024-07-02T11:00:00.000Z"),
        created_on: new Date("2024-07-02T11:00:00.000Z"),
      };
      const request = httpMocks.createRequest({
        method: "POST",
        url: "/expense/1",
        params: { boat_id: "1" },
        body: body,
      });
      const response: MockResponse<Response> = createResponse();

      when(ExpenseService.createExpense)
        .calledWith({ ...body, boat_id: 1 })
        .mockReturnValueOnce(Promise.resolve(null));
      await createExpense(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.BAD_REQUEST);
      expect(response._getJSONData()).toEqual({ message: "Error creating expense, please try again" });
    });

    it("should return a 500 error when an exception is thrown", async () => {
      const body: CreateExpenseDTO = {
        expense_type: "Fuel",
        amount: 100,
        boat_id: 1,
        expense_date: new Date("2024-07-02T11:00:00.000Z"),
        created_on: new Date("2024-07-02T11:00:00.000Z"),
      };
      const request = httpMocks.createRequest({
        method: "POST",
        url: "/expense/1",
        params: { boat_id: "1" },
        body: body,
      });
      const response: MockResponse<Response> = createResponse();

      when(ExpenseService.createExpense)
        .calledWith({ ...body, boat_id: 1 })
        .mockRejectedValueOnce(new Error("Test error"));
      await createExpense(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response._getJSONData()).toEqual("Test error");
    });
  });

  describe("updateExpense", () => {
    it("should return an updated expense", async () => {
      const body: UpdateExpenseDTO = {
        expense_type: "Maintenance",
        expense_date: new Date("2024-07-02T11:00:00.000Z"),
        created_on: new Date("2024-07-02T11:00:00.000Z"),
        amount: 200,
      };
      const request = httpMocks.createRequest({
        method: "PUT",
        url: "/expense/1",
        params: { id: "1" },
        body: body,
      });
      const response: MockResponse<Response> = createResponse();
      const returnValue = { id: 1, ...body };

      when(ExpenseService.updateExpense)
        .calledWith(1, body)
        .mockReturnValueOnce(Promise.resolve(returnValue));
      await updateExpense(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.OK);

      const responseData = response._getJSONData();
      const formattedResponseData = {
        ...responseData,
        expense_date: new Date(responseData.expense_date).toISOString(),
        created_on: new Date(responseData.created_on).toISOString(),
      };

      const expectedData = {
        ...returnValue,
        expense_date: new Date(returnValue.expense_date).toISOString(),
        created_on: new Date(returnValue.created_on).toISOString(),
      };

      expect(formattedResponseData).toEqual(expectedData);
    });


    it("should return a 404 error when expense is not found", async () => {
      const body: UpdateExpenseDTO = {
        expense_type: "Maintenance",
        amount: 200,
        expense_date: new Date("2024-07-02T11:00:00.000Z"),
        created_on: new Date("2024-07-02T11:00:00.000Z"),
      };
      const request = httpMocks.createRequest({
        method: "PUT",
        url: "/expense/1",
        params: { id: "1" },
        body: body,
      });
      const response: MockResponse<Response> = createResponse();

      when(ExpenseService.updateExpense).calledWith(1, body).mockReturnValueOnce(Promise.resolve(null));
      await updateExpense(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.NOT_FOUND);
      expect(response._getJSONData()).toEqual({ message: "Expense not found" });
    });

    it("should return a 500 error when an exception is thrown", async () => {
      const body: UpdateExpenseDTO = {
        expense_type: "Maintenance",
        amount: 200,
        expense_date: new Date("2024-07-02T11:00:00.000Z"),
        created_on: new Date("2024-07-02T11:00:00.000Z"),
      };
      const request = httpMocks.createRequest({
        method: "PUT",
        url: "/expense/1",
        params: { id: "1" },
        body: body,
      });
      const response: MockResponse<Response> = createResponse();

      when(ExpenseService.updateExpense).calledWith(1, body).mockRejectedValueOnce(new Error("Test error"));
      await updateExpense(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response._getJSONData()).toEqual("Test error");
    });
  });

  describe("deleteExpense", () => {
    it("should return a 204 status when expense is successfully deleted", async () => {
      const request = httpMocks.createRequest({
        method: "DELETE",
        url: "/expense/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(ExpenseService.deleteExpense).calledWith(1).mockReturnValueOnce(Promise.resolve(true));
      await deleteExpense(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.NO_CONTENT);
    });

    it("should return a 404 error when expense is not found", async () => {
      const request = httpMocks.createRequest({
        method: "DELETE",
        url: "/expense/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(ExpenseService.deleteExpense).calledWith(1).mockReturnValueOnce(Promise.resolve(false));
      await deleteExpense(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.NOT_FOUND);
      expect(response._getJSONData()).toEqual({ message: "Expense not found" });
    });

    it("should return a 500 error when an exception is thrown", async () => {
      const request = httpMocks.createRequest({
        method: "DELETE",
        url: "/expense/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(ExpenseService.deleteExpense).calledWith(1).mockRejectedValueOnce(new Error("Test error"));
      await deleteExpense(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response._getJSONData()).toEqual("Test error");
    });
  });
});
