import { getIO } from "./socket";

type EntityType =
  | "todo"
  | "source"
  | "stock"
  | "comment"
  | "analysis"
  | "decision"
  | "attachment";

type ActionType = "created" | "updated" | "deleted";

interface BroadcastEvent {
  type: `${EntityType}.${ActionType}`;
  entity: EntityType;
  data: Record<string, any>;
  userId: string;
  timestamp: string;
}

export function broadcast(
  entity: EntityType,
  action: ActionType,
  data: Record<string, any>,
  userId: string
): void {
  try {
    const io = getIO();
    const event: BroadcastEvent = {
      type: `${entity}.${action}`,
      entity,
      data,
      userId,
      timestamp: new Date().toISOString(),
    };
    io.emit("event", event);
  } catch (err) {
    if (err instanceof Error && err.message === "Socket.io not initialized") {
      return;
    }
    console.error("[WS] Broadcast error:", err);
  }
}
