"use client";

import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/lib/api";

/**
 * Single shared Socket.IO connection used for realtime problem chat. Writes
 * still go through the REST API; the socket only receives broadcast events
 * (`message:new`, `message:deleted`, `problem:solved`, `problem:typing`).
 */
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function joinProblem(problemId: string) {
  getSocket().emit("problem:join", problemId);
}

export function leaveProblem(problemId: string) {
  getSocket().emit("problem:leave", problemId);
}
