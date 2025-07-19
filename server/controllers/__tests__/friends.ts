import httpMocks, { createResponse, MockResponse } from "node-mocks-http";
import { Response } from "express";
import { when } from "jest-when";
import { FriendService } from "../../services/friends";
import { UserService } from "../../services";
import {
  sendFriendRequest,
  respondToFriendRequest,
  getFriends,
  removeFriend,
  getPendingRequests,
  getFriendsLogs,
} from "../friends";
import { FriendRequestDTO, FriendUserDTO, FriendsLogDTO } from "../../interfaces/friends";

jest.mock("../../services/friends");

describe("FriendsController", () => {
  const mockUser = { id: 1, email: "user@email.com", name: "User" };
  const mockFriend = { id: 2, email: "friend@email.com", name: "Friend" };

  beforeAll(() => {
    jest.spyOn(UserService, "getUserById").mockImplementation(async (id: number) => {
      return { id, email: "user@email.com", username: "user1", password: "", created: new Date().toISOString() };
    });
  });

  describe("sendFriendRequest", () => {
    it("should return 201 and the request when successful", async () => {
      const now = new Date();
      const request = httpMocks.createRequest({
        method: "POST",
        url: "/friends/request",
        user: { id: 1 },
        body: { email: "friend@email.com" },
      });
      const response: MockResponse<Response> = createResponse();
      const mockRequest: FriendRequestDTO = {
        id: 1,
        sender_id: 1,
        receiver_id: 2,
        status: "pending",
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        sender_details: {
          id: 1,
          username: "user1",
          email: "user@email.com",
        },
      };

      when(FriendService.sendFriendRequest)
        .calledWith(1, "friend@email.com", undefined)
        .mockResolvedValueOnce(mockRequest);

      await sendFriendRequest(request, response);
      expect(response._getStatusCode()).toBe(201);
      expect(response._getJSONData()).toEqual(mockRequest);
    });

    it("should return 404 if user not found", async () => {
      const request = httpMocks.createRequest({
        method: "POST",
        url: "/friends/request",
        user: { id: 1 },
        body: { email: "notfound@email.com" },
      });
      const response: MockResponse<Response> = createResponse();

      when(FriendService.sendFriendRequest)
        .calledWith(1, "notfound@email.com", undefined)
        .mockResolvedValueOnce("not_found");

      await sendFriendRequest(request, response);
      expect(response._getStatusCode()).toBe(404);
    });

    it("should return 400 if already friends", async () => {
      const request = httpMocks.createRequest({
        method: "POST",
        url: "/friends/request",
        user: { id: 1 },
        body: { email: "friend@email.com" },
      });
      const response: MockResponse<Response> = createResponse();

      when(FriendService.sendFriendRequest)
        .calledWith(1, "friend@email.com", undefined)
        .mockResolvedValueOnce("already_friends");

      await sendFriendRequest(request, response);
      expect(response._getStatusCode()).toBe(400);
    });
  });

  describe("respondToFriendRequest", () => {
    it("should return 200 if accepted", async () => {
      const request = httpMocks.createRequest({
        method: "POST",
        url: "/friends/respond",
        user: { id: 2 },
        body: { requestId: 1, accept: true },
      });
      const response: MockResponse<Response> = createResponse();

      when(FriendService.respondToFriendRequest)
        .calledWith(2, 1, true)
        .mockResolvedValueOnce("Friend request accepted");

      await respondToFriendRequest(request, response);
      expect(response._getStatusCode()).toBe(200);
      expect(response._getJSONData()).toEqual({ message: "Friend request accepted" });
    });

    it("should return 404 if request not found", async () => {
      const request = httpMocks.createRequest({
        method: "POST",
        url: "/friends/respond",
        user: { id: 2 },
        body: { requestId: 99, accept: true },
      });
      const response: MockResponse<Response> = createResponse();

      when(FriendService.respondToFriendRequest).calledWith(2, 99, true).mockResolvedValueOnce("not_found");

      await respondToFriendRequest(request, response);
      expect(response._getStatusCode()).toBe(404);
    });
  });

  describe("getFriends", () => {
    it("should return 200 and a list of friends", async () => {
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/friends/1",
        params: { userId: "1" },
      });
      const response: MockResponse<Response> = createResponse();
      const friends: FriendUserDTO[] = [mockFriend];

      when(FriendService.getFriends).calledWith(1).mockResolvedValueOnce(friends);

      await getFriends(request, response);
      expect(response._getStatusCode()).toBe(200);
      expect(response._getJSONData()).toEqual(friends);
    });
  });

  describe("removeFriend", () => {
    it("should return 204 if friend removed", async () => {
      const request = httpMocks.createRequest({
        method: "DELETE",
        url: "/friends/2",
        user: { id: 1 },
        params: { friendId: "2" },
      });
      const response: MockResponse<Response> = createResponse();

      when(FriendService.removeFriend).calledWith(1, 2).mockResolvedValueOnce(true);

      await removeFriend(request, response);
      expect(response._getStatusCode()).toBe(204);
    });

    it("should return 404 if friend relationship not found", async () => {
      const request = httpMocks.createRequest({
        method: "DELETE",
        url: "/friends/2",
        user: { id: 1 },
        params: { friendId: "2" },
      });
      const response: MockResponse<Response> = createResponse();

      when(FriendService.removeFriend).calledWith(1, 2).mockResolvedValueOnce(false);

      await removeFriend(request, response);
      expect(response._getStatusCode()).toBe(404);
    });
  });

  describe("getPendingRequests", () => {
    it("should return 200 and a list of pending requests", async () => {
      const now = new Date();
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/friends/requests/2",
        params: { userId: "2" },
      });
      const response: MockResponse<Response> = createResponse();
      const requests: FriendRequestDTO[] = [
        {
          id: 1,
          sender_id: 1,
          receiver_id: 2,
          status: "pending",
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          sender_details: {
            id: 1,
            username: "user1",
            email: "user@email.com",
          },
        },
      ];

      when(FriendService.getPendingRequests).calledWith(2).mockResolvedValueOnce(requests);

      await getPendingRequests(request, response);
      expect(response._getStatusCode()).toBe(200);
      expect(response._getJSONData()).toEqual(requests);
    });
  });

  describe("getFriendsLogs", () => {
    it("should return 200 and a list of logs", async () => {
      const now = new Date();
      const request = httpMocks.createRequest({
        method: "GET",
        url: "/friends/2/logs",
        params: { userId: "2" },
      });
      const response: MockResponse<Response> = createResponse();
      const logs: FriendsLogDTO[] = [
        {
          id: 1,
          boat_id: 1,
          description: "Trip",
          crew_members: [],
          coordinates: [],
          log_started: now.toISOString(),
          log_ended: now.toISOString(),
          created_on: now.toISOString(),
          boat: { name: "Boat", model: "Model" },
          user: mockFriend,
        },
      ];

      when(FriendService.getFriendsLogs).calledWith(2).mockResolvedValueOnce(logs);

      await getFriendsLogs(request, response);
      expect(response._getStatusCode()).toBe(200);
      expect(response._getJSONData()).toEqual(logs);
    });
  });
});
