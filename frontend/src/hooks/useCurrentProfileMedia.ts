import { useEffect, useRef, useState, useCallback } from "react";
import { getCurrentProfileMedia } from "@/lib/api/profile-media-current";
import type {
  GetCurrentProfileMediaResponse,
} from "@/types/profile-media-current";

type State = {
  data: GetCurrentProfileMediaResponse | null;
  loading: boolean;
  error: string | null;
};

export function useCurrentProfileMedia(userId: string | null) {

  const [state, setState] = useState<State>({
    data: null,
    loading: false,
    error: null,
  });

  /**
   * Track mounted state (prevent memory leak)
   */
  const isMountedRef = useRef(true);

  /**
   * Track latest request id (prevent race overwrite)
   */
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * =========================================================
   * Load authoritative data from backend
   * =========================================================
   */
  const load = useCallback(
    async (validUserId: string) => {

      const currentRequestId = ++requestIdRef.current;

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {

        const result =
          await getCurrentProfileMedia(validUserId);

        /**
         * Ignore if:
         * - unmounted
         * - outdated request
         */
        if (
          !isMountedRef.current ||
          currentRequestId !== requestIdRef.current
        ) {
          return;
        }

        setState({
          data: result,
          loading: false,
          error: null,
        });

      } catch (err: any) {

        if (
          !isMountedRef.current ||
          currentRequestId !== requestIdRef.current
        ) {
          return;
        }

        const message =
          typeof err?.response?.data?.message === "string"
            ? err.response.data.message
            : "ไม่สามารถโหลดรูปโปรไฟล์ได้";

        setState({
          data: null,
          loading: false,
          error: message,
        });

      }

    },
    [],
  );

  /**
   * =========================================================
   * Auto load when userId changes
   * =========================================================
   */
  useEffect(() => {

    if (!userId) {

      setState({
        data: null,
        loading: false,
        error: null,
      });

      return;
    }

    void load(userId);

  }, [userId, load]);

  /**
   * =========================================================
   * Manual refetch
   * =========================================================
   */
  const refetch = useCallback(async () => {

    if (!userId) return;

    await load(userId);

  }, [userId, load]);

  /**
   * =========================================================
   * Optimistic avatar update
   * =========================================================
   */
  const setAvatarLocally = useCallback(
    (avatarUrl: string) => {

      setState((prev) => {

        if (!prev.data?.avatar) return prev;

        return {
          ...prev,
          data: {
            ...prev.data,
            avatar: {
              ...prev.data.avatar,
              url: avatarUrl,
            },
          },
        };

      });

    },
    [],
  );

  /**
   * =========================================================
   * Optimistic cover update (FIX)
   * =========================================================
   */
  const setCoverLocally = useCallback(
    (coverUrl: string) => {

      setState((prev) => {

        if (!prev.data?.cover) return prev;

        return {
          ...prev,
          data: {
            ...prev.data,
            cover: {
              ...prev.data.cover,
              url: coverUrl,
            },
          },
        };

      });

    },
    [],
  );

  /**
   * =========================================================
   * Return hook API
   * =========================================================
   */
  return {

    data: state.data,
    loading: state.loading,
    error: state.error,

    refetch,

    // optimistic updates
    setAvatarLocally,
    setCoverLocally,

  };

}
