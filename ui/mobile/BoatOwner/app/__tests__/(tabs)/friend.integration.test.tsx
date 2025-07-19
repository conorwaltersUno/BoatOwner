import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Friend from '../../(tabs)/friend';
import * as hooks from '@/hooks/useFriends';

jest.mock('@/hooks/useFriends');
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    setAuthenticated: jest.fn(),
    signOut: jest.fn(),
    authLoading: false,
    user: { id: 99, username: 'me', email: 'me@email.com' },
  }),
}));

const mockPendingRequests = [
  { id: 1, sender_id: 2, receiver_id: 99, status: 'pending', created_at: '', updated_at: '', sender_details: { id: 2, username: 'alice', email: 'alice@email.com' } },
  { id: 2, sender_id: 99, receiver_id: 3, status: 'pending', created_at: '', updated_at: '', sender_details: { id: 99, username: 'me', email: 'me@email.com' } },
];

describe('Friend tab integration', () => {
  beforeEach(() => {
    (hooks.usePendingRequests as jest.Mock).mockReturnValue({ data: mockPendingRequests, isLoading: false, error: null });
    (hooks.useCancelPendingFriendRequest as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
    (hooks.useFriendsList as jest.Mock).mockReturnValue({ data: [], isLoading: false, error: null });
    (hooks.useSearchUsers as jest.Mock).mockReturnValue({ data: [], isLoading: false, error: null });
    (hooks.useSendFriendRequest as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
    (hooks.useAcceptFriendRequest as jest.Mock).mockReturnValue({ mutate: jest.fn() });
    (hooks.useRejectFriendRequest as jest.Mock).mockReturnValue({ mutate: jest.fn() });
    (hooks.useFriendsLogs as jest.Mock).mockReturnValue({ data: [], isLoading: false, error: null });
    (hooks.useRemoveFriend as jest.Mock).mockReturnValue({ mutate: jest.fn() });
  });

  it('shows Cancel button for outgoing pending requests in search results', async () => {
    // Patch currentUserId for test
    jest.spyOn(React, 'useState').mockImplementationOnce(() => ['manage', jest.fn()]);
    // Mock search results to include a user with pendingRequestId
    (hooks.useSearchUsers as jest.Mock).mockReturnValue({
      data: [
        { id: 3, username: 'bob', email: 'bob@email.com', friendStatus: 'pending', pendingRequestId: 2 },
      ],
      isLoading: false,
      error: null,
    });
    const { getByText, queryByPlaceholderText } = render(<Friend />);
    // Switch to Manage Friends tab to show search UI
    fireEvent.press(getByText('Manage Friends'));
    // Now get the search input and simulate entering a query
    const searchInput = queryByPlaceholderText('Search users by username...');
    if (searchInput) {
      fireEvent.changeText(searchInput, 'bob');
    }
    await waitFor(() => getByText('Search Results'));
    // Should see Cancel button in search results for bob
    expect(getByText('Cancel')).toBeTruthy();
  });
});
