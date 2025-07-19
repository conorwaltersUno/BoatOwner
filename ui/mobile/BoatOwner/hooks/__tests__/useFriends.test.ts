import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as friendsApi from '../friends.fetch';
import { useCancelPendingFriendRequest } from '../useFriends';

jest.mock('../friends.fetch');

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCancelPendingFriendRequest', () => {
  it('calls cancelPendingFriendRequest and handles success', async () => {
    (friendsApi.cancelPendingFriendRequest as jest.Mock).mockResolvedValue(undefined);
    const { result, waitFor } = renderHook(() => useCancelPendingFriendRequest(), { wrapper: createWrapper() });
    act(() => {
      result.current.mutate(123);
    });
    await waitFor(() => result.current.isSuccess);
    expect(friendsApi.cancelPendingFriendRequest).toHaveBeenCalledWith(123);
  });

  it('handles error', async () => {
    (friendsApi.cancelPendingFriendRequest as jest.Mock).mockRejectedValue(new Error('fail'));
    const { result, waitFor } = renderHook(() => useCancelPendingFriendRequest(), { wrapper: createWrapper() });
    act(() => {
      result.current.mutate(123);
    });
    await waitFor(() => result.current.isError);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
