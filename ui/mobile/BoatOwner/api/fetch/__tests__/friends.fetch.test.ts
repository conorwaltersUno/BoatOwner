import { cancelPendingFriendRequest } from '../friends.fetch';

// Mock authFetch
jest.mock('../auth.fetch', () => ({
  authFetch: jest.fn(),
}));

const { authFetch } = require('../auth.fetch');

describe('cancelPendingFriendRequest', () => {
  it('calls the correct endpoint and method', async () => {
    (authFetch as jest.Mock).mockResolvedValue({ ok: true, status: 204 });
    await expect(cancelPendingFriendRequest(123)).resolves.toBeUndefined();
    expect(authFetch).toHaveBeenCalledWith(expect.stringContaining('/requests/123'), expect.objectContaining({ method: 'DELETE' }));
  });

  it('throws on error response', async () => {
    (authFetch as jest.Mock).mockResolvedValue({ ok: false, status: 400, json: async () => ({ message: 'fail' }) });
    await expect(cancelPendingFriendRequest(123)).rejects.toThrow('fail');
  });
});
