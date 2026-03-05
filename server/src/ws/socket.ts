import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/jwt";

interface ConnectedUser {
  userId: string;
  socketId: string;
  connectedAt: Date;
}

const connectedUsers = new Map<string, ConnectedUser[]>();
const ipConnections = new Map<string, number>();

const MAX_CONNECTIONS_PER_IP = 10;
const PING_INTERVAL = 25000;
const PING_TIMEOUT = 10000;

let io: Server;

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5173"],
      credentials: true,
    },
    pingInterval: PING_INTERVAL,
    pingTimeout: PING_TIMEOUT,
    transports: ["websocket", "polling"],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const secret = getJwtSecret();
      const decoded = jwt.verify(token, secret) as { userId: string; username: string };
      (socket as any).userId = decoded.userId;
      (socket as any).username = decoded.username;
      next();
    } catch (err) {
      if (err instanceof Error && err.message.includes("JWT secret not configured")) {
        return next(new Error("Server configuration error"));
      }
      next(new Error("Invalid token"));
    }
  });

  io.use((socket, next) => {
    const ip = socket.handshake.address;
    const current = ipConnections.get(ip) || 0;
    if (current >= MAX_CONNECTIONS_PER_IP) {
      return next(new Error("Too many connections from this IP"));
    }
    next();
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId as string;
    const username = (socket as any).username as string;
    const ip = socket.handshake.address;

    const currentIpCount = ipConnections.get(ip) || 0;
    ipConnections.set(ip, currentIpCount + 1);

    const userSockets = connectedUsers.get(userId) || [];
    userSockets.push({
      userId,
      socketId: socket.id,
      connectedAt: new Date(),
    });
    connectedUsers.set(userId, userSockets);

    io.emit("event", {
      type: "user.presence",
      entity: "user",
      data: { userId, username, online: true },
      userId,
      timestamp: new Date().toISOString(),
    });

    socket.on("error", (err) => {
      console.error(`[WS] Socket error for user ${userId}:`, err.message);
    });

    socket.on("disconnect", () => {
      const count = ipConnections.get(ip) || 1;
      if (count <= 1) {
        ipConnections.delete(ip);
      } else {
        ipConnections.set(ip, count - 1);
      }

      const sockets = connectedUsers.get(userId) || [];
      const remaining = sockets.filter((s) => s.socketId !== socket.id);
      if (remaining.length === 0) {
        connectedUsers.delete(userId);
        io.emit("event", {
          type: "user.presence",
          entity: "user",
          data: { userId, username, online: false },
          userId,
          timestamp: new Date().toISOString(),
        });
      } else {
        connectedUsers.set(userId, remaining);
      }
    });
  });

  return io;
}

export function getOnlineUsers(): string[] {
  return Array.from(connectedUsers.keys());
}
