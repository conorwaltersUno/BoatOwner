import httpMocks, { createResponse, MockResponse } from "node-mocks-http";
import { Response } from "express";
import { when } from "jest-when";
import { BoatService } from "../../services/boats";
import { getAllBoats, getBoatById, createBoat, updateBoat, deleteBoat } from "../boats";
import { StatusCodes } from "http-status-codes";
import { MockUser, MockUserArray } from "../../test-utils/test-data/user";
import { MockBoat } from "../../test-utils/test-data/boats";
import { UserService } from "../../services";

jest.mock("../../services/users");
jest.mock("../../services/boats");
jest.mock("@prisma/client");

describe("BoatController", () => {
  describe("getAllBoats", () => {
    it("should return a list of boats", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/boat/",
      });
      const response: MockResponse<Response> = createResponse();
      const returnValue = MockUserArray;

      when(BoatService.getAllBoats).calledWith().mockReturnValueOnce(Promise.resolve(returnValue));
      await getAllBoats(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.OK);
      expect(response._getJSONData()).toEqual(MockUserArray);
    });
  });

  describe("getBoatById", () => {
    it("should return a boat by id", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/boat/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();
      const returnValue = MockUser;

      when(BoatService.getBoatById).calledWith(1).mockReturnValueOnce(Promise.resolve(returnValue));
      await getBoatById(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.OK);
      expect(response._getJSONData()).toEqual(MockUser);
    });

    it("should return a 404 error when boat is not found", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/boat/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(BoatService.getBoatById).calledWith(1).mockReturnValueOnce(Promise.resolve(null));
      await getBoatById(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.NOT_FOUND);
      expect(response._getJSONData()).toEqual({ message: "Boat not found" });
    });

    it("should return a 500 error when an exception is thrown", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/boat/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(BoatService.getBoatById)
        .calledWith(1)
        .mockImplementationOnce(() => {
          throw new Error("Test error");
        });

      await getBoatById(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response._getJSONData()).toEqual("Test error");
    });
  });

  describe("createBoat", () => {
    it("should return a created boat", async () => {
      const body = MockBoat;
      const request = httpMocks.createRequest({
        method: "POST",
        url: "/boat",
        body: body,
      });
      const response: MockResponse<Response> = createResponse();
      when(UserService.getUserById).calledWith(1).mockReturnValueOnce(Promise.resolve(MockUser));
      when(BoatService.createBoat).calledWith(body).mockReturnValueOnce(Promise.resolve(MockBoat));

      await createBoat(request, response);
      expect(response._getStatusCode()).toEqual(StatusCodes.CREATED);
      expect(response._getJSONData()).toEqual(MockBoat);
    });

    it("should return a 400 error if user is not found", async () => {
      const body = MockBoat;
      const request = httpMocks.createRequest({
        method: "POST",
        url: "/boat",
        body: body,
      });
      const response: MockResponse<Response> = createResponse();

      when(UserService.getUserById).calledWith(body.user_id).mockReturnValueOnce(Promise.resolve(null));

      await createBoat(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.BAD_REQUEST);
      expect(response._getJSONData()).toEqual({ message: "Error creating boat, user id does not exist in database" });
    });

    it("should return a 500 error if an exception is thrown", async () => {
      const body = MockBoat;
      const request = httpMocks.createRequest({
        method: "POST",
        url: "/boat",
        body: body,
      });
      const response: MockResponse<Response> = createResponse();

      when(UserService.getUserById)
        .calledWith(body.user_id)
        .mockImplementationOnce(() => {
          throw new Error("Test error");
        });

      await createBoat(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response._getJSONData()).toEqual("Test error");
    });
  });

  describe("updateBoat", () => {
    it("should return an updated boat", async () => {
      const body = { name: "Updated Boat", model: "Z400" };
      const request = httpMocks.createRequest({
        method: "PUT",
        url: "/boat/1",
        params: { id: "1" },
        body: body,
      });
      const response: MockResponse<Response> = createResponse();
      const updatedBoat = { ...MockBoat, ...body };

      when(BoatService.updateBoat).calledWith(1, body).mockReturnValueOnce(Promise.resolve(updatedBoat));

      await updateBoat(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.OK);
      expect(response._getJSONData()).toEqual(updatedBoat);
    });

    it("should return a 404 error when boat is not found", async () => {
      const body = { name: "Updated Boat", model: "Z400" };
      const request = httpMocks.createRequest({
        method: "PUT",
        url: "/boat/1",
        params: { id: "1" },
        body: body,
      });
      const response: MockResponse<Response> = createResponse();

      when(BoatService.updateBoat).calledWith(1, body).mockReturnValueOnce(Promise.resolve(null));

      await updateBoat(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.NOT_FOUND);
      expect(response._getJSONData()).toEqual({ message: "Boat not found" });
    });

    it("should return a 500 error when an exception is thrown", async () => {
      const body = { name: "Updated Boat", model: "Z400" };
      const request = httpMocks.createRequest({
        method: "PUT",
        url: "/boat/1",
        params: { id: "1" },
        body: body,
      });
      const response: MockResponse<Response> = createResponse();

      when(BoatService.updateBoat)
        .calledWith(1, body)
        .mockImplementationOnce(() => {
          throw new Error("Test error");
        });

      await updateBoat(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response._getJSONData()).toEqual("Test error");
    });
  });

  describe("deleteBoat", () => {
    it("should return a 204 status when boat is successfully deleted", async () => {
      const request = httpMocks.createRequest({
        method: "DELETE",
        url: "/boat/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(BoatService.deleteBoat).calledWith(1).mockReturnValueOnce(Promise.resolve(true));

      await deleteBoat(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.NO_CONTENT);
    });

    it("should return a 404 error when boat is not found", async () => {
      const request = httpMocks.createRequest({
        method: "DELETE",
        url: "/boat/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(BoatService.deleteBoat).calledWith(1).mockReturnValueOnce(Promise.resolve(false));

      await deleteBoat(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.NOT_FOUND);
      expect(response._getJSONData()).toEqual({ message: "Boat not found" });
    });

    it("should return a 500 error when an exception is thrown", async () => {
      const request = httpMocks.createRequest({
        method: "DELETE",
        url: "/boat/1",
        params: { id: "1" },
      });
      const response: MockResponse<Response> = createResponse();

      when(BoatService.deleteBoat)
        .calledWith(1)
        .mockImplementationOnce(() => {
          throw new Error("Test error");
        });

      await deleteBoat(request, response);

      expect(response._getStatusCode()).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response._getJSONData()).toEqual("Test error");
    });
  });
});
