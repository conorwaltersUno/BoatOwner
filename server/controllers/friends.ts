import { Request, Response } from "express";
import { FriendService } from "../services/friends";
import { FriendRequestDTO, FriendUserDTO, FriendsLogDTO } from "../interfaces/friends";
import { body } from "express-validator";
import { UserService } from "../services";
import { UserDTO } from "../interfaces/user";

const okStatus = 200;
const createdStatus = 201;
const noContentStatus = 204;
const badRequestStatus = 400;
const notFoundStatus = 404;
const internalServerError = 500;

// Send a friend request by email or userId
export async function sendFriendRequest(req: Request, res: Response) {
  try {
    const senderId = req.body.userId;
    const { email, userId } = req.body;
    const rawResult = await FriendService.sendFriendRequest(senderId, email, userId);

    if (rawResult === "not_found") {
      return res.status(notFoundStatus).json({ message: "User not found" });
    }
    if (rawResult === "self") {
      return res.status(badRequestStatus).json({ message: "Cannot send friend request to yourself" });
    }
    if (rawResult === "already_friends") {
      return res.status(badRequestStatus).json({ message: "Already friends" });
    }
    if (rawResult === "already_sent") {
      return res.status(badRequestStatus).json({ message: "Friend request already sent" });
    }
    // Convert 'created' property to ISO string if present
    const result: FriendRequestDTO = {
      ...rawResult,
      created: rawResult.created instanceof Date ? rawResult.created.toISOString() : rawResult.created,
    };
    return res.status(createdStatus).json(result);
  } catch (err: any) {
    return res.status(internalServerError).json({ message: err.message || "Internal server error" });
  }
}

// Accept or decline a friend request
export async function respondToFriendRequest(req: Request, res: Response) {
  try {
    const userId = req.body.userId;
    const { requestId, accept } = req.body;
    const result: string = await FriendService.respondToFriendRequest(userId, requestId, accept);

    if (result === "not_found") {
      return res.status(notFoundStatus).json({ message: "Friend request not found" });
    }
    if (result === "forbidden") {
      return res.status(403).json({ message: "Not authorized to respond to this request" });
    }
    if (result === "already_responded") {
      return res.status(badRequestStatus).json({ message: "Request already responded to" });
    }
    return res.status(okStatus).json({ message: result });
  } catch (err: any) {
    return res.status(internalServerError).json({ message: err.message || "Internal server error" });
  }
}

// Get all friends for a user
export async function getFriends(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const friends: FriendUserDTO[] = await FriendService.getFriends(userId);
    return res.status(okStatus).json(friends);
  } catch (err: any) {
    return res.status(internalServerError).json({ message: err.message || "Internal server error" });
  }
}

// Remove a friend
export async function removeFriend(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const friendId = parseInt(req.params.friendId, 10);
    const removed: boolean = await FriendService.removeFriend(userId, friendId);

    if (!removed) {
      return res.status(notFoundStatus).json({ message: "Friend relationship not found" });
    }
    return res.sendStatus(noContentStatus);
  } catch (err: any) {
    return res.status(internalServerError).json({ message: err.message || "Internal server error" });
  }
}

// Get all pending friend requests for a user
export async function getPendingRequests(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId, 10);
    // Get pending requests with sender info
    const rawRequests = await FriendService.getPendingRequests(userId);

    // Fetch sender info for each request
    const requests: FriendRequestDTO[] = await Promise.all(
      rawRequests.map(async (req: any) => {
        // If sender info is already joined, use it; otherwise, fetch it
        let sender = req.sender;
        if (!sender) {
          // Lazy-load sender info if not present
          const user = await UserService.getUserById(req.sender_id);
          sender = user ? { id: user.id, email: user.email } : undefined;
        }
        return {
          ...req,
          created: req.created instanceof Date ? req.created.toISOString() : req.created,
          sender,
        };
      })
    );
    return res.status(okStatus).json(requests);
  } catch (err: any) {
    return res.status(internalServerError).json({ message: err.message || "Internal server error" });
  }
}

// Get all logs for all friends of a user
export async function getFriendsLogs(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const rawLogs = await FriendService.getFriendsLogs(userId);
    const logs: FriendsLogDTO[] = rawLogs.map((log: any) => ({
      ...log,
      user: log.user, // Ensure this property exists or map it appropriately
    }));
    return res.status(okStatus).json(logs);
  } catch (err: any) {
    return res.status(internalServerError).json({ message: err.message || "Internal server error" });
  }
}

// Search for users by email or other criteria
export async function searchUsers(req: Request, res: Response) {
  try {
    const q = req.body.q as string;
    const userId = parseInt(req.body.userId);
    // Call the service to search users
    const results = await FriendService.searchUsers(q, userId);
    return res.status(200).json(results);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
}

/**
 * Cancel a pending friend request sent by the current user.
 * DELETE /api/friends/requests/:id
 */
export async function cancelPendingFriendRequestController(req: Request, res: Response) {
  try {
    const requestId = parseInt(req.params.id, 10);
    if (isNaN(requestId)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }
    // Support both req.user.id and req.user?.payload?.userid
    const userId = (req as any).user?.id || (req as any).user?.payload?.userid;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    await cancelPendingFriendRequest(requestId, userId);
    return res.status(204).send();
  } catch (err: any) {
    if (err.message === 'Friend request not found') {
      return res.status(404).json({ message: err.message });
    }
    if (err.message === 'Not authorized to cancel this request') {
      return res.status(403).json({ message: err.message });
    }
    if (err.message === 'Only pending requests can be cancelled') {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Failed to cancel friend request' });
  }
}
