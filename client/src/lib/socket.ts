import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentToken: string | null = null;

export function getSocket(): Socket | null {
  return socket;
}

// H4: Track current token and force reconnect if it changed
export function connectSocket(token: string): Socket {
  if (socket && currentToken === token && socket.connected) {
    return socket;
  }

  // Disconnect old socket if token changed
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  currentToken = token;

  const url =
    import.meta.env.VITE_WS_URL ||
    (import.meta.env.PROD ? window.location.origin : "http://localhost:3000");

  socket = io(url, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}
