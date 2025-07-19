import { prisma } from "../utilities";

// Send a friend request by username, email, or userId
async function sendFriendRequest(
  senderId: number,
  receiver_username?: string,
  email?: string,
  userId?: number
) {
  let receiver: any = null;
  if (receiver_username) {
    receiver = await prisma.user.findUnique({ where: { username: receiver_username } });
  } else if (email) {
    receiver = await prisma.user.findUnique({ where: { email } });
  } else if (userId) {
    receiver = await prisma.user.findUnique({ where: { id: userId } });
  }
  if (!receiver) throw new Error("User not found");
  if (receiver.id === senderId) throw new Error("Cannot send friend request to yourself");

  // Check if already friends
  const alreadyFriends = await prisma.friends.findFirst({
    where: {
      OR: [
        { user_id: senderId, friend_id: receiver.id },
        { user_id: receiver.id, friend_id: senderId },
      ],
    },
  });
  if (alreadyFriends) throw new Error("Already friends");

  // Check if a request already exists (any status)
  const existingRequest = await prisma.friend_requests.findFirst({
    where: {
      sender_id: senderId,
      receiver_id: receiver.id,
    },
  });

  if (existingRequest) {
    if (existingRequest.status === "pending") {
      throw new Error("Friend request already sent");
    } else {
      // Update the existing request to pending and reset any relevant fields
      const updatedRequest = await prisma.friend_requests.update({
        where: { id: existingRequest.id },
        data: { status: "pending" },
      });
      return updatedRequest;
    }
  }

  // No existing request, create a new one
  const request = await prisma.friend_requests.create({
    data: {
      sender_id: senderId,
      receiver_id: receiver.id,
      status: "pending",
    },
  });

  return request;
}

// Accept or decline a friend request
async function respondToFriendRequest(userId: number, requestId: number, accept: boolean) {
  const request = await prisma.friend_requests.findUnique({ where: { id: requestId } });
  if (!request) return "not_found";
  if (request.receiver_id !== userId) return "forbidden";
  if (request.status !== "pending") return "already_responded";

  if (accept) {
    // Create friend relationship (bidirectional)
    await prisma.friends.createMany({
      data: [
        { user_id: userId, friend_id: request.sender_id },
        { user_id: request.sender_id, friend_id: userId },
      ],
      skipDuplicates: true,
    });
    await prisma.friend_requests.update({
      where: { id: requestId },
      data: { status: "accepted" },
    });
    return "Friend request accepted";
  } else {
    await prisma.friend_requests.update({
      where: { id: requestId },
      data: { status: "declined" },
    });
    return "Friend request declined";
  }
}

// Get all friends for a user
async function getFriends(userId: number) {
  const friends = await prisma.friends.findMany({
    where: { user_id: userId },
    select: { friend_id: true },
  });
  const friendUsers = await prisma.user.findMany({
    where: { id: { in: friends.map((f) => f.friend_id) } },
    select: { id: true, username: true },
  });
  return friendUsers;
}

// Remove a friend
async function removeFriend(userId: number, friendId: number) {
  // Delete friend relationship (bidirectional)
  const deleted = await prisma.friends.deleteMany({
    where: {
      OR: [
        { user_id: userId, friend_id: friendId },
        { user_id: friendId, friend_id: userId },
      ],
    },
  });

  // Cascade delete all friend requests between these users
  await prisma.friend_requests.deleteMany({
    where: {
      OR: [
        { sender_id: userId, receiver_id: friendId },
        { sender_id: friendId, receiver_id: userId },
      ],
    },
  });

  return deleted.count > 0;
}

// Get all pending friend requests for a user
async function getPendingRequests(userId: number) {
  const requests = await prisma.friend_requests.findMany({
    where: { receiver_id: userId, status: "pending" },
  });
  return requests;
}

// Get all logs for all friends of a user
async function getFriendsLogs(userId: number) {
  // Get all friend IDs
  const friends = await prisma.friends.findMany({
    where: { user_id: userId },
    select: { friend_id: true },
  });
  const friendIds = friends.map((f) => f.friend_id);

  // Get all logs for these friends, including boat and user info
  const logs = await prisma.logs.findMany({
    where: { boat: { user_id: { in: friendIds } } },
    include: {
      boat: {
        select: {
          name: true,
          model: true,
          user: { select: { id: true, username: true } },
        },
      },
    },
    orderBy: { created_on: "desc" },
  });

  return logs;
}

// Search for users by email or username, excluding certain userId
async function searchUsers(query: string, excludeUserId: number) {
  // Get current friends' IDs
  const friends = await prisma.friends.findMany({
    where: { user_id: excludeUserId },
    select: { friend_id: true },
  });
  const friendIds = friends.map((f) => f.friend_id);

  // Search users by email or username, excluding self and current friends
  const users = await prisma.user.findMany({
    where: {
      id: { notIn: [excludeUserId, ...friendIds] },
      OR: [
        { email: { contains: query, mode: "insensitive" } },
        { username: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { id: true, email: true, username: true },
    take: 10,
  });

  // For each user, check for a pending friend request (sent or received)
  const results = await Promise.all(
    users.map(async (u) => {
      // Check if current user sent a pending request to this user
      const sent = await prisma.friend_requests.findFirst({
        where: {
          sender_id: excludeUserId,
          receiver_id: u.id,
          status: "pending",
        },
      });
      if (sent) {
        return {
          ...u,
          friendStatus: "pending",
          pendingRequestId: sent.id,
        };
      }
      // Check if this user sent a pending request to current user
      const incoming = await prisma.friend_requests.findFirst({
        where: {
          sender_id: u.id,
          receiver_id: excludeUserId,
          status: "pending",
        },
      });
      if (incoming) {
        return {
          ...u,
          friendStatus: "incoming",
          pendingRequestId: incoming.id,
        };
      }
      return {
        ...u,
        friendStatus: "none",
        pendingRequestId: null,
      };
    })
  );
  return results;
}

// Cancel a pending friend request (sender can cancel only if pending)
async function cancelPendingFriendRequest(requestId: number, userId: number) {
  const request = await prisma.friend_requests.findUnique({ where: { id: requestId } });
  if (!request) throw new Error("Friend request not found");
  if (request.sender_id !== userId) throw new Error("Not authorized to cancel this request");
  if (request.status !== "pending") throw new Error("Cannot cancel a non-pending request");

  await prisma.friend_requests.delete({ where: { id: requestId } });
  return "Friend request canceled";
}

export const FriendService = {
  sendFriendRequest,
  respondToFriendRequest,
  getFriends,
  removeFriend,
  getPendingRequests,
  getFriendsLogs,
  searchUsers,
  cancelPendingFriendRequest,
};
