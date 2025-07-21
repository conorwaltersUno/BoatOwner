import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface DataPrefetchContextType {
  prefetchAllData: () => Promise<void>;
  prefetching: boolean;
  prefetchError: string | null;
}

const DataPrefetchContext = createContext<DataPrefetchContextType>({
  prefetchAllData: async () => {},
  prefetching: false,
  prefetchError: null,
});

export const DataPrefetchProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [prefetching, setPrefetching] = useState(false);
  const [prefetchError, setPrefetchError] = useState<string | null>(null);

  // These fetch functions should match the keys used in your React Query hooks
  const fetchFriends = () => queryClient.prefetchQuery(['friends']);
  const fetchFriendRequests = () => queryClient.prefetchQuery(['friendRequests']);
  const fetchFriendsFeed = () => queryClient.prefetchQuery(['friendsFeed']);
  const fetchCalendarLogs = () => queryClient.prefetchQuery(['calendarLogs']);
  const fetchExpenses = () => queryClient.prefetchQuery(['expenses']);
  const fetchTasks = () => queryClient.prefetchQuery(['tasks']);

  const prefetchAllData = async () => {
    setPrefetching(true);
    setPrefetchError(null);
    try {
      await Promise.all([
        fetchFriends(),
        fetchFriendRequests(),
        fetchFriendsFeed(),
        fetchCalendarLogs(),
        fetchExpenses(),
        fetchTasks(),
      ]);
    } catch (err: any) {
      setPrefetchError('Failed to load your data. Please try again.');
      console.error('[DataPrefetchContext] Prefetch error:', err);
    } finally {
      setPrefetching(false);
    }
  };

  return (
    <DataPrefetchContext.Provider value={{ prefetchAllData, prefetching, prefetchError }}>
      {children}
    </DataPrefetchContext.Provider>
  );
};

export const useDataPrefetch = () => useContext(DataPrefetchContext);
