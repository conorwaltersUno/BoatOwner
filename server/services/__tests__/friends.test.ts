import { FriendService } from '../friends';
import { prismaAsAny } from '../../test-utils/prisma';

describe('FriendsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchUsers', () => {
    it('should return users matching the query and exclude friends/self', async () => {
      prismaAsAny.friends.findMany.mockResolvedValueOnce([{ user_id: 1, friend_id: 2 }, { user_id: 1, friend_id: 3 }]);
      prismaAsAny.user.findMany.mockResolvedValueOnce([
        { id: 4, username: 'bob', email: 'bob@email.com' },
      ]);
      const result = await FriendService.searchUsers('bo', 1);
      expect(result).toEqual([{ id: 4, username: 'bob', email: 'bob@email.com' }]);
    });
  });

  describe('sendFriendRequest', () => {
    it('should throw if username is invalid', async () => {
      await expect(FriendService.sendFriendRequest(1, ''))
        .rejects.toThrow();
    });
    it('should throw if user not found', async () => {
      prismaAsAny.user.findUnique.mockResolvedValueOnce(null);
      await expect(FriendService.sendFriendRequest(1, 'bob@email.com'))
        .rejects.toThrow();
    });
    it('should throw if sending to self', async () => {
      prismaAsAny.user.findUnique.mockResolvedValueOnce({ id: 1 });
      await expect(FriendService.sendFriendRequest(1, 'me@email.com'))
        .rejects.toThrow();
    });
    it('should throw if already friends', async () => {
      prismaAsAny.user.findUnique.mockResolvedValueOnce({ id: 2 });
      prismaAsAny.friends.findFirst.mockResolvedValueOnce({});
      await expect(FriendService.sendFriendRequest(1, 'bob@email.com'))
        .rejects.toThrow();
    });
    it('should throw if request already sent', async () => {
      prismaAsAny.user.findUnique.mockResolvedValueOnce({ id: 2 });
      prismaAsAny.friends.findFirst.mockResolvedValueOnce(null);
      prismaAsAny.friend_requests.findFirst.mockResolvedValueOnce({});
      await expect(FriendService.sendFriendRequest(1, 'bob@email.com'))
        .rejects.toThrow();
    });
    it('should throw if reverse request exists', async () => {
      prismaAsAny.user.findUnique.mockResolvedValueOnce({ id: 2 });
      prismaAsAny.friends.findFirst.mockResolvedValueOnce(null);
      prismaAsAny.friend_requests.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({});
      await expect(FriendService.sendFriendRequest(1, 'bob@email.com'))
        .rejects.toThrow();
    });
    it('should create a friend request', async () => {
      prismaAsAny.user.findUnique.mockResolvedValueOnce({ id: 2 });
      prismaAsAny.friends.findFirst.mockResolvedValueOnce(null);
      prismaAsAny.friend_requests.findFirst.mockResolvedValueOnce(null);
      prismaAsAny.friend_requests.findFirst.mockResolvedValueOnce(null);
      prismaAsAny.friend_requests.create.mockResolvedValueOnce({
        id: 1,
        sender_id: 1,
        receiver_id: 2,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
        user_friend_requests_sender_idTouser: { id: 1, username: 'alice', email: 'alice@email.com' }
      });
      const result = await FriendService.sendFriendRequest(1, 'bob@email.com');
      if (typeof result === 'string') throw new Error(result);
      expect(result.sender_id).toBe(1);
      expect(result.receiver_id).toBe(2);
      expect(result.status).toBe('pending');
    });
  });

  // Add similar tests for getPendingRequests, acceptFriendRequest, rejectFriendRequest, removeFriend, getFriendsList, getFriendsLogs
});
