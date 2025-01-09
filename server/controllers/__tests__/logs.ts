import httpMocks, { createResponse, MockResponse } from "node-mocks-http";
import { Response } from "express";
import { when } from "jest-when";
import { LogService } from "../../services/logs";
import { getAllLogs, getLogById, createLog, deleteLog } from "../logs";
import { StatusCodes } from "http-status-codes";
import { MockLogArray, MockLogCreate } from "../../test-utils/test-data/logs";
import { BoatService } from "../../services";
import { MockBoat } from "../../test-utils/test-data/boats";

jest.mock("../../services/logs");
jest.mock("../../services/boats");
jest.mock("@prisma/client");

describe("LogsController", () => {
  describe("getAllLogs", () => {
    it("should return a list of logs", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/logs/",
      });
      const response: MockResponse<Response> = createResponse();
      const returnValue = {
        ...MockLogArray,
        log_started: new Date().toISOString(),
        log_ended: new Date().toISOString(),
        created_on: new Date().toISOString(),
      };

      when(LogService.getAllLogs).calledWith().mockReturnValueOnce(Promise.resolve(returnValue));

      await getAllLogs(request, response);

      const jsonResponse = response._getJSONData();

      expect(response._getStatusCode()).toEqual(StatusCodes.OK);
    });

    it("should return a 204 status when no logs are found", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/logs",
      });
      const response: MockResponse<Response> = createResponse();

      when(LogService.getAllLogs).calledWith().mockReturnValueOnce(null);
      await getAllLogs(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.NO_CONTENT);
      expect(response._getJSONData()).toEqual("No logs found");
    });

    it("should return a 500 error when an exception is thrown", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/logs/",
      });
      const response: MockResponse<Response> = createResponse();

      when(LogService.getAllLogs).calledWith().mockRejectedValueOnce(new Error("Test error"));
      await getAllLogs(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response._getJSONData()).toEqual({ message: "Test error" });
    });
  });

  describe("getLogById", () => {
    it("should return a log by id", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/logs/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();
      const returnValue = {
        ...MockLogCreate,
        log_started: new Date().toISOString(),
        log_ended: new Date().toISOString(),
        created_on: new Date().toISOString(),
      };

      when(LogService.getLogById).calledWith(1).mockReturnValueOnce(Promise.resolve(returnValue));
      await getLogById(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.OK);
      expect(response._getJSONData()).toEqual(returnValue);
    });

    it("should return a 404 error when log is not found", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/logs/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(LogService.getLogById).calledWith(1).mockReturnValueOnce(Promise.resolve(null));
      await getLogById(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.NOT_FOUND);
      expect(response._getJSONData()).toEqual({ message: "Log not found" });
    });

    it("should return a 500 error when an exception is thrown", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/logs/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(LogService.getLogById).calledWith(1).mockRejectedValueOnce(new Error("Test error"));
      await getLogById(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response._getJSONData()).toEqual({ message: "Test error" });
    });
  });

  describe("createLog", () => {
    it("should return a created log", async () => {
      const request = httpMocks.createRequest({
        method: "POST",
        url: "/logs",
        params: { boat_id: 1 },
        body: MockLogCreate,
      });
      const response: MockResponse<Response> = createResponse();
      const returnValue = { ...MockLogCreate, id: 1 };

      when(BoatService.getBoatById).calledWith(1).mockReturnValueOnce(Promise.resolve(MockBoat));
      when(LogService.createLog).calledWith(MockLogCreate).mockReturnValueOnce(Promise.resolve(returnValue));
      await createLog(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.CREATED);
    });

    it("should return a 500 error if log creation fails", async () => {
      const request = httpMocks.createRequest({
        method: "POST",
        url: "/logs/1",
        params: { boat_id: 1 },
        body: MockLogCreate,
      });
      const response: MockResponse<Response> = createResponse();

      when(BoatService.getBoatById).calledWith(1).mockReturnValueOnce(Promise.resolve(MockBoat));
      when(LogService.createLog).calledWith(1, MockLogCreate).mockRejectedValueOnce(new Error("Test error"));
      await createLog(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response._getJSONData()).toEqual({ message: "Test error" });
    });

    it("should return a 500 error when an exception is thrown", async () => {
      const request = httpMocks.createRequest({
        method: "POST",
        url: "/logs/NaN",
        params: { boat_id: NaN },
        body: MockLogCreate,
      });
      const response: MockResponse<Response> = createResponse();

      when(LogService.createLog).calledWith(MockLogCreate).mockRejectedValueOnce(new Error("Test error"));
      await createLog(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.BAD_REQUEST);
      expect(response._getJSONData()).toEqual({ message: "Boat ID does not exist in the database" });
    });
  });

  describe("deleteLog", () => {
    it("should return a 204 status when log is successfully deleted", async () => {
      const request = httpMocks.createRequest({
        method: "DELETE",
        url: "/logs/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(LogService.deleteLog).calledWith(1).mockReturnValueOnce(Promise.resolve(true));
      await deleteLog(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.NO_CONTENT);
    });

    it("should return a 404 error when log is not found", async () => {
      const request = httpMocks.createRequest({
        method: "DELETE",
        url: "/logs/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(LogService.deleteLog).calledWith(1).mockReturnValueOnce(Promise.resolve(false));
      await deleteLog(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.NOT_FOUND);
      expect(response._getJSONData()).toEqual({ message: "Log not found" });
    });

    it("should return a 500 error when an exception is thrown", async () => {
      const request = httpMocks.createRequest({
        method: "DELETE",
        url: "/logs/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(LogService.deleteLog).calledWith(1).mockRejectedValueOnce(new Error("Test error"));
      await deleteLog(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response._getJSONData()).toEqual({ message: "Test error" });
    });
  });
});
