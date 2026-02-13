// frontend/src/hooks/useProfileMedia.ts

import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/lib/api/api";
import type { ProfileMediaItem } 
  from "@/types/profile-media-feed";

export type ProfileMediaType = "AVATAR" | "COVER";

interface ApiResponse {
  items: {
    id: string;
    url: string;
    createdAt: string;
    postId: string; 
  }[];
  nextCursor: string | null;
}

type State = {
  items: ProfileMediaItem[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor: string | null;
};

export function useProfileMedia(
  userId: string | null,
  type: ProfileMediaType,
) {
  const [state, setState] = useState<State>({
    items: [],
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: false,
    nextCursor: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const resetState = useCallback(() => {
    setState({
      items: [],
      loading: false,
      loadingMore: false,
      error: null,
      hasMore: false,
      nextCursor: null,
    });
  }, []);

  const fetchPage = useCallback(
    async (cursor: string | null, isLoadMore: boolean) => {
      if (!userId) return;

      const currentRequestId = ++requestIdRef.current;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState((prev) => ({
        ...prev,
        loading: !isLoadMore,
        loadingMore: isLoadMore,
        error: null,
      }));

      try {
        const res = await api.get<ApiResponse>(
          `/users/${userId}/profile-media`,
          {
            params: {
              type,
              cursor: cursor ?? undefined,
              limit: 20,
            },
            withCredentials: true,
            signal: controller.signal,
          },
        );

        if (
          !isMountedRef.current ||
          currentRequestId !== requestIdRef.current
        ) {
          return;
        }

        const data = res.data;

        const mappedItems: ProfileMediaItem[] = data.items.map((item) => ({
  id: item.id,
  url: item.url,
  createdAt: item.createdAt,
  postId: item.postId,  
  type,                 
}));


setState((prev) => ({
  ...prev,
  items: isLoadMore
    ? [...prev.items, ...mappedItems]
    : mappedItems,
  hasMore: Boolean(data.nextCursor),
  nextCursor: data.nextCursor,
  loading: false,
  loadingMore: false,
  error: null,
}));

      } catch (err: any) {
        if (
          !isMountedRef.current ||
          currentRequestId !== requestIdRef.current ||
          err?.name === "CanceledError"
        ) {
          return;
        }

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "ไม่สามารถโหลดรูปได้";

        setState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          error: message,
        }));
      }
    },
    [userId, type],
  );

  // Auto load when userId / type change
  useEffect(() => {
    if (!userId) {
      resetState();
      return;
    }

    resetState();
    fetchPage(null, false);
  }, [userId, type, fetchPage, resetState]);

  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loadingMore) return;

    await fetchPage(state.nextCursor, true);
  }, [state.hasMore, state.loadingMore, state.nextCursor, fetchPage]);

  const refetch = useCallback(async () => {
    if (!userId) return;
    resetState();
    await fetchPage(null, false);
  }, [userId, fetchPage, resetState]);

  return {
    items: state.items,
    loading: state.loading,
    loadingMore: state.loadingMore,
    error: state.error,
    hasMore: state.hasMore,
    loadMore,
    refetch,
  };
}

