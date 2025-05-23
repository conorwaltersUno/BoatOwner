import { prisma } from "../utilities";

// Send a friend request by email or userId
async function sendFriendRequest(senderId: number, email?: string, userId?: number) {
  let receiver: any = null;
  if (email) {
    receiver = await prisma.user.findUnique({ where: { email } });
  } else if (userId) {
    receiver = await prisma.user.findUnique({ where: { id: userId } });
  }
  if (!receiver) return "not_found";
  if (receiver.id === senderId) return "self";

  // Check if already friends
  const alreadyFriends = await prisma.friends.findFirst({
    where: {
      OR: [
        { user_id: senderId, friend_id: receiver.id },
        { user_id: receiver.id, friend_id: senderId },
      ],
    },
  });
  if (alreadyFriends) return "already_friends";

  // Check if a request already exists (any status)
  const existingRequest = await prisma.friend_requests.findFirst({
    where: {
      sender_id: senderId,
      receiver_id: receiver.id,
    },
  });

  if (existingRequest) {
    if (existingRequest.status === "pending") {
      return "already_sent";
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
    select: { id: true, email: true },
  });
  return friendUsers;
}

// Remove a friend
async function removeFriend(userId: number, friendId: number) {
  const deleted = await prisma.friends.deleteMany({
    where: {
      OR: [
        { user_id: userId, friend_id: friendId },
        { user_id: friendId, friend_id: userId },
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

  // Get all logs for these friends
  const logs = await prisma.logs.findMany({
    where: { boat: { user_id: { in: friendIds } } },
    include: {
      boat: { select: { name: true, model: true } },
    },
    orderBy: { created_on: "desc" },
  });

  return logs;
}

// Search for users by email or name, excluding certain userId
async function searchUsers(query: string, excludeUserId: number) {
  // Get current friends' IDs
  const friends = await prisma.friends.findMany({
    where: { user_id: excludeUserId },
    select: { friend_id: true },
  });
  const friendIds = friends.map((f) => f.friend_id);

  // Search users by email or name, excluding self and current friends
  const users = await prisma.user.findMany({
    where: {
      id: { notIn: [excludeUserId, ...friendIds] },
      OR: [{ email: { contains: query, mode: "insensitive" } }],
    },
    select: { id: true, email: true },
    take: 10,
  });
  return users;
}

export const FriendService = {
  sendFriendRequest,
  respondToFriendRequest,
  getFriends,
  removeFriend,
  getPendingRequests,
  getFriendsLogs,
  searchUsers,
};
