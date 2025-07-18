import { friendsService } from '../friends';
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
      const result = await friendsService.searchUsers('bo', 1);
      expect(result).toEqual([{ id: 4, username: 'bob', email: 'bob@email.com' }]);
    });
  });

  describe('sendFriendRequest', () => {
    it('should throw if username is invalid', async () => {
      await expect(friendsService.sendFriendRequest(1, { receiver_username: '' })).rejects.toThrow('Invalid username');
    });
    it('should throw if user not found', async () => {
      prismaAsAny.user.findUnique.mockResolvedValueOnce(null);
      await expect(friendsService.sendFriendRequest(1, { receiver_username: 'bob' })).rejects.toThrow('User not found');
    });
    it('should throw if sending to self', async () => {
      prismaAsAny.user.findUnique.mockResolvedValueOnce({ id: 1 });
      await expect(friendsService.sendFriendRequest(1, { receiver_username: 'me' })).rejects.toThrow('Cannot send friend request to yourself');
    });
    it('should throw if already friends', async () => {
      prismaAsAny.user.findUnique.mockResolvedValueOnce({ id: 2 });
      prismaAsAny.friends.findFirst.mockResolvedValueOnce({});
      await expect(friendsService.sendFriendRequest(1, { receiver_username: 'bob' })).rejects.toThrow('You are already friends');
    });
    it('should throw if request already sent', async () => {
      prismaAsAny.user.findUnique.mockResolvedValueOnce({ id: 2 });
      prismaAsAny.friends.findFirst.mockResolvedValueOnce(null);
      prismaAsAny.friend_requests.findFirst.mockResolvedValueOnce({});
      await expect(friendsService.sendFriendRequest(1, { receiver_username: 'bob' })).rejects.toThrow('Friend request already sent');
    });
    it('should throw if reverse request exists', async () => {
      prismaAsAny.user.findUnique.mockResolvedValueOnce({ id: 2 });
      prismaAsAny.friends.findFirst.mockResolvedValueOnce(null);
      prismaAsAny.friend_requests.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({});
      await expect(friendsService.sendFriendRequest(1, { receiver_username: 'bob' })).rejects.toThrow('User has already sent you a friend request');
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
      const result = await friendsService.sendFriendRequest(1, { receiver_username: 'bob' });
      expect(result.sender_id).toBe(1);
      expect(result.receiver_id).toBe(2);
      expect(result.status).toBe('pending');
    });
  });

  // Add similar tests for getPendingRequests, acceptFriendRequest, rejectFriendRequest, removeFriend, getFriendsList, getFriendsLogs
});
