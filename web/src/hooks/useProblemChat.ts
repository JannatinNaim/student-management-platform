"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { getSocket, joinProblem, leaveProblem } from "@/lib/socket";
import type { ApiListResponse, ProblemDetail, ProblemMessage } from "@/lib/types";

export const messagesKey = (problemId: string) => ["problem-messages", problemId];
export const problemKey = (problemId: string) => ["problem", problemId];

/**
 * Loads a problem's messages and keeps them live via Socket.IO. New messages,
 * deletions and "solved" events broadcast by the server are merged into the
 * React Query cache so every viewer stays in sync without polling.
 */
export function useProblemChat(problemId: string) {
  const queryClient = useQueryClient();
  const [typingName, setTypingName] = useState<string | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useQuery({
    queryKey: messagesKey(problemId),
    queryFn: async () => {
      const { data } = await api.get<ApiListResponse<ProblemMessage>>(
        `/problems/${problemId}/messages`,
        { params: { limit: 50 } }
      );
      return data.data;
    },
  });

  useEffect(() => {
    const socket = getSocket();
    joinProblem(problemId);

    const onNew = (msg: ProblemMessage) => {
      if (msg.problemId !== problemId) return;
      queryClient.setQueryData<ProblemMessage[]>(messagesKey(problemId), (prev) => {
        if (!prev) return [msg];
        if (prev.some((m) => m.id === msg.id)) return prev; // de-dupe own echo
        return [...prev, msg];
      });
    };

    const onDeleted = ({ id }: { id: string }) => {
      queryClient.setQueryData<ProblemMessage[]>(messagesKey(problemId), (prev) =>
        prev?.filter((m) => m.id !== id)
      );
    };

    const onSolved = ({ messageId }: { problemId: string; messageId: string }) => {
      queryClient.setQueryData<ProblemMessage[]>(messagesKey(problemId), (prev) =>
        prev?.map((m) => ({ ...m, isSolution: m.id === messageId }))
      );
      queryClient.setQueryData<ProblemDetail>(problemKey(problemId), (prev) =>
        prev ? { ...prev, status: "SOLVED", solutionMessageId: messageId } : prev
      );
    };

    const onTyping = ({ name }: { name: string }) => {
      setTypingName(name);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTypingName(null), 2500);
    };

    socket.on("message:new", onNew);
    socket.on("message:deleted", onDeleted);
    socket.on("problem:solved", onSolved);
    socket.on("problem:typing", onTyping);

    return () => {
      socket.off("message:new", onNew);
      socket.off("message:deleted", onDeleted);
      socket.off("problem:solved", onSolved);
      socket.off("problem:typing", onTyping);
      leaveProblem(problemId);
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [problemId, queryClient]);

  const emitTyping = (name: string) => {
    getSocket().emit("problem:typing", { problemId, name });
  };

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    typingName,
    emitTyping,
  };
}
