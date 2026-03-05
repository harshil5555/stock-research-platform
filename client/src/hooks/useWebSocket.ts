import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { useAuthStore } from "../stores/authStore";

interface WSEvent {
  type: string;
  entity: string;
  data: Record<string, unknown>;
  userId: string;
  timestamp: string;
}

const ENTITY_QUERY_KEYS: Record<string, string[]> = {
  todo: ["todos", "dashboard"],
  source: ["sources", "dashboard"],
  stock: ["stocks", "dashboard"],
  comment: ["comments"],
  analysis: ["analyses"],
  decision: ["decisions"],
  attachment: ["attachments"],
};

export function useWebSocket(): void {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const setUserOnline = useAuthStore((s) => s.setUserOnline);
  const setUserOffline = useAuthStore((s) => s.setUserOffline);
  const clearOnlineUsers = useAuthStore((s) => s.clearOnlineUsers);

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    const handleEvent = (event: WSEvent) => {
      if (event.type === "user.presence") {
        if (event.data.online) {
          setUserOnline(event.data.userId as string);
        } else {
          setUserOffline(event.data.userId as string);
        }
        return;
      }

      const queryKeys = ENTITY_QUERY_KEYS[event.entity];
      if (queryKeys) {
        queryKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }

      if (event.data?.id && ENTITY_QUERY_KEYS[event.entity]) {
        queryClient.invalidateQueries({
          queryKey: [ENTITY_QUERY_KEYS[event.entity][0], event.data.id],
        });
      }
    };

    socket.on("event", handleEvent);

    return () => {
      socket.off("event", handleEvent);
      clearOnlineUsers();
      disconnectSocket();
    };
  }, [token, queryClient, setUserOnline, setUserOffline, clearOnlineUsers]);
}
