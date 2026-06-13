import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { corsOrigin } from "./cors";

/**
 * Realtime layer for problem-solving chat.
 *
 * Writes always go through the REST routes (authoritative: validation, points,
 * persistence, notifications). After a successful write the route calls
 * `emitToProblem(...)` to broadcast the change to everyone viewing that problem.
 * The socket therefore only delivers/relays public events and needs no hard
 * auth, which keeps it immune to the short-lived access-token expiry.
 */

let io: Server | null = null;

const roomFor = (problemId: string) => `problem:${problemId}`;

export function initRealtime(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: corsOrigin, credentials: true },
    // keep the path on the default `/socket.io` so the client can use defaults
  });

  io.on("connection", (socket) => {
    socket.on("problem:join", (problemId: unknown) => {
      if (typeof problemId === "string" && problemId) socket.join(roomFor(problemId));
    });

    socket.on("problem:leave", (problemId: unknown) => {
      if (typeof problemId === "string" && problemId) socket.leave(roomFor(problemId));
    });

    // Best-effort typing indicator relayed to others in the room.
    socket.on(
      "problem:typing",
      (payload: { problemId?: string; name?: string } | undefined) => {
        if (!payload?.problemId) return;
        socket.to(roomFor(payload.problemId)).emit("problem:typing", {
          name: typeof payload.name === "string" ? payload.name.slice(0, 60) : "Someone",
        });
      }
    );
  });

  return io;
}

/** Broadcast an event to everyone currently viewing a problem. No-op until initialised. */
export function emitToProblem(problemId: string, event: string, payload: unknown): void {
  io?.to(roomFor(problemId)).emit(event, payload);
}
