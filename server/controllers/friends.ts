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

    // Fetch sender details for the response
    const sender = await UserService.getUserById(senderId);
    const sender_details = sender
      ? { id: sender.id, username: sender.username, email: sender.email }
      : { id: senderId, username: '', email: '' };

    const result: FriendRequestDTO = {
      id: rawResult.id,
      sender_id: rawResult.sender_id,
      receiver_id: rawResult.receiver_id,
      status: rawResult.status as 'pending' | 'accepted' | 'rejected',
      created_at: rawResult.created_at instanceof Date ? rawResult.created_at.toISOString() : rawResult.created_at,
      updated_at: rawResult.updated_at instanceof Date ? rawResult.updated_at.toISOString() : rawResult.updated_at,
      sender_details,
    };
    return res.status(createdStatus).json(result);
  } catch (err: any) {
    if (err.message === "User not found") {
      return res.status(notFoundStatus).json({ message: err.message });
    }
    if (err.message === "Cannot send friend request to yourself") {
      return res.status(badRequestStatus).json({ message: err.message });
    }
    if (err.message === "Already friends") {
      return res.status(badRequestStatus).json({ message: err.message });
    }
    if (err.message === "Friend request already sent") {
      return res.status(badRequestStatus).json({ message: err.message });
    }
    res.status(internalServerError).json({ message: err.message });
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
    res.status(internalServerError).json({ message: err.message });
  }
}

// Get all friends for a user
export async function getFriends(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const friends: FriendUserDTO[] = await FriendService.getFriends(userId);
    return res.status(okStatus).json(friends);
  } catch (err: any) {
    res.status(internalServerError).json({ message: err.message });
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
    res.status(internalServerError).json({ message: err.message });
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
        let sender = req.sender;
        if (!sender) {
          const user = await UserService.getUserById(req.sender_id);
          sender = user
            ? { id: user.id, username: user.username, email: user.email }
            : { id: req.sender_id, username: '', email: '' };
        }
        return {
          id: req.id,
          sender_id: req.sender_id,
          receiver_id: req.receiver_id,
          status: req.status as 'pending' | 'accepted' | 'rejected',
          created_at: req.created_at instanceof Date ? req.created_at.toISOString() : req.created_at,
          updated_at: req.updated_at instanceof Date ? req.updated_at.toISOString() : req.updated_at,
          sender_details: sender,
        };
      })
    );
    return res.status(okStatus).json(requests);
  } catch (err: any) {
    res.status(internalServerError).json({ message: err.message });
  }
}

// Get all logs for all friends of a user
export async function getFriendsLogs(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const rawLogs = await FriendService.getFriendsLogs(userId);
    // Each log must include: user (id, username, email) and boat (name, model)
    const logs: FriendsLogDTO[] = rawLogs.map((log: any) => ({
      id: log.id,
      boat_id: log.boat_id,
      description: log.description,
      crew_members: log.crew_members,
      coordinates: log.coordinates,
      log_started: log.log_started,
      log_ended: log.log_ended,
      created_on: log.created_on,
      boat: {
        name: log.boat?.name || '',
        model: log.boat?.model || '',
      },
      user: log.boat?.user
        ? {
            id: log.boat.user.id,
            username: log.boat.user.username,
            email: log.boat.user.email,
          }
        : { id: 0, username: 'Unknown User', email: '' },
    }));
    return res.status(okStatus).json(logs);
  } catch (err: any) {
    res.status(internalServerError).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
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
    await FriendService.cancelPendingFriendRequest(requestId, userId);
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
    res.status(500).json({ message: 'Failed to cancel friend request' });
  }
}
