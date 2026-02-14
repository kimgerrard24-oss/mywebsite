// frontend/src/hooks/useProfileMediaRealtime.ts

"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";
import { useUserStore } from "@/stores/user.store";

export function useProfileMediaRealtime() {
  const { user } = useUserStore();
  const { refreshUser } = useAuth();
  const currentMedia = useCurrentProfileMedia(user?.id ?? null);

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    if (!socket) return;

    const handler = async () => {
      // backend authority → re-sync
      await refreshUser();
      await currentMedia.refetch();
    };

    socket.on("profile:media-deleted", handler);

    return () => {
      socket.off("profile:media-deleted", handler);
    };
  }, [user, refreshUser, currentMedia]);
}

