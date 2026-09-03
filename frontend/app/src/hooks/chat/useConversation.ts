"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { getConversationTurns, getToken, sendMessage } from "@/lib/training";
import type { ConversationTurn } from "@/types/training";

interface StepUpdate {
  previous_step: string;
  met: boolean;
  score: number;
  current_step: string;
}

interface StreamEvent {
  type: "start" | "token" | "done" | "error";
  message_uuid?: string;
  content?: string;
  step_update?: StepUpdate;
  detail?: string;
}

// Placeholder key for the in-flight assistant turn while tokens stream in.
// Swapped for the real uuid once the "done" event arrives.
const STREAM_PLACEHOLDER_UUID = "__streaming__";

// If we're still "sending" after this long, assume a "done"/"error" event
// was lost somewhere (dropped connection, infra timeout, etc.) and fall
// back to the REST source of truth. Generation can legitimately take a
// while, so this is a last resort, not the primary recovery path.
const STUCK_SENDING_TIMEOUT_MS = 90_000;

export function useConversation(sessionUuid: string) {
  const [messages, setMessages] = useState<ConversationTurn[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepUpdate, setStepUpdate] = useState<StepUpdate | null>(null);
  // fetch-event-source is cancelled through AbortController.
  const streamControllerRef = useRef<AbortController | null>(null);
  // Tracks whether we've already had one successful "open" on this
  // EventSource. A second "open" means the browser auto-reconnected
  // after a drop — that's when we want to resync against the DB.
  const hasOpenedRef = useRef(false);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConversationTurns(sessionUuid);
      setMessages(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load conversation"
      );
    } finally {
      setLoading(false);
    }
  }, [sessionUuid]);

  // Initial hydration of any turns that already existed before this
  // page loaded (e.g. the user refreshed mid-session).
  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  // One long-lived SSE connection for the whole session. Each user
  // message triggers a start -> token* -> done sequence on this stream.
  useEffect(() => {
    if (!sessionUuid) {
      return;
    }

    hasOpenedRef.current = false;

    const controller = new AbortController();
    streamControllerRef.current = controller;

    const connect = async () => {
      const authToken = await getToken();

      if (!authToken) {
        setError("You are not authenticated.");
        return;
      }

      try {
        await fetchEventSource(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/session/${sessionUuid}/stream/`,
          {
            method: "GET",
            headers: {
              Accept: "text/event-stream",
              Authorization: `Bearer ${authToken.accessToken}`,
            },
            credentials: "include",
            signal: controller.signal,

            async onopen(response) {
              if (!response.ok) {
                throw new Error(
                  `Failed to connect to event stream: ${response.status}`
                );
              }

              const contentType =
                response.headers.get("content-type") ?? "";

              if (!contentType.includes("text/event-stream")) {
                throw new Error(
                  `Expected text/event-stream but received ${contentType}`
                );
              }

              if (hasOpenedRef.current) {
                // Reconnected successfully. Redis replay should cover
                // missed events, but REST is the final source of truth.
                void loadMessages();
              }

              hasOpenedRef.current = true;
            },

            onmessage(event) {
              let data: StreamEvent;

              try {
                data = JSON.parse(event.data);
              } catch {
                return;
              }
              if (data.type === "start") {
                setSending(true);

                setMessages((prev) => {
                  if (
                    prev.some(
                      (turn) =>
                        turn.uuid === STREAM_PLACEHOLDER_UUID
                    )
                  ) {
                    return prev;
                  }

                  const placeholder: ConversationTurn = {
                    uuid: STREAM_PLACEHOLDER_UUID,
                    role: "AI",
                    content: "",
                    created_at: new Date().toISOString(),
                  };

                  return [...prev, placeholder];
                });

                return;
              }


              if (data.type === "token" && data.content) {
                const token = data.content;

                setMessages((prev) =>
                  prev.map((turn) =>
                    turn.uuid === STREAM_PLACEHOLDER_UUID
                      ? {
                          ...turn,
                          content: turn.content + token,
                        }
                      : turn
                  )
                );

                return;
              }

              if (data.type === "done") {
                setSending(false);

                const finalUuid =
                  data.message_uuid ?? STREAM_PLACEHOLDER_UUID;

                setMessages((prev) => {
                  const alreadyPresent = prev.some(
                    (turn) =>
                      turn.uuid === finalUuid &&
                      turn.uuid !== STREAM_PLACEHOLDER_UUID
                  );

                  if (alreadyPresent) {
                    return prev.filter(
                      (turn) =>
                        turn.uuid !== STREAM_PLACEHOLDER_UUID
                    );
                  }

                  return prev.map((turn) =>
                    turn.uuid === STREAM_PLACEHOLDER_UUID
                      ? {
                          ...turn,
                          uuid: finalUuid,
                          content:
                            data.content ?? turn.content,
                        }
                      : turn
                  );
                });

                if (data.step_update) {
                  setStepUpdate(data.step_update);
                }

                return;
              }

              if (data.type === "error") {
                setSending(false);

                setError(
                  data.detail ??
                    "The assistant failed to respond. Please try again."
                );

                setMessages((prev) =>
                  prev.filter(
                    (turn) =>
                      turn.uuid !== STREAM_PLACEHOLDER_UUID
                  )
                );
              }
            },

            onclose() {
              // The server intentionally closes the stream after
              // "done" or "error". fetch-event-source will stop here.
              //
              // If you want automatic reconnection after unexpected
              // closes, the backend should keep the connection open
              // or this can throw to trigger retry logic.
              if (controller.signal.aborted) {
                return; // intentional unmount, don't reconnect
              }
              throw new Error("Stream closed unexpectedly"); // triggers fetch-event-source retry
            
            },

            onerror(error) {
              // Do not report an error when the component is intentionally
              // unmounting or the stream was explicitly aborted.
              if (controller.signal.aborted) {
                throw error;
              }

              setSending((current) => {
                if (current) {
                  setError(
                    "Lost connection to the training session. Reconnecting…"
                  );
                }

                return current;
              });

              // Throwing tells fetch-event-source that this failure
              // should participate in its retry behaviour.
              throw error;
            },
          }
        );
      } catch (error) {
        // Ignore intentional aborts during cleanup/session changes.
        if (controller.signal.aborted) {
          return;
        }

        setSending(false);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to connect to the training session."
        );
      }
    };
    void connect();

    return () => {
      controller.abort();

      if (streamControllerRef.current === controller) {
        streamControllerRef.current = null;
      }
    };
  }, [sessionUuid, loadMessages]);

  // Failsafe: if we're stuck "sending" for too long, a terminal event
  // (done/error) was likely lost somewhere outside our control. Fall
  // back to the REST source of truth rather than hanging forever.
  useEffect(() => {
    if (!sending) {
      return;
    }
 
    const timeout = window.setTimeout(() => {
      void loadMessages();
      setSending(false);
    }, STUCK_SENDING_TIMEOUT_MS);
 
    return () => window.clearTimeout(timeout);
  }, [sending, loadMessages]);

  // One long-lived SSE connection for the whole session. Each user
  // message triggers a start -> token* -> done sequence on this stream.
  const handleSendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) {
        return;
      }

      setSending(true);
      setError(null);

      // Show the user's own message immediately; the assistant's
      // reply streams in over SSE once Celery picks the job up.
      const optimisticTurn: ConversationTurn = {
        uuid: `optimistic-${Date.now()}`,
        role: "User",
        content: trimmed,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticTurn]);

      try {
        await sendMessage(sessionUuid, trimmed);
        // No reload here — the assistant turn arrives via the SSE
        // start/token/done events handled above.
      } catch (error) {
        setMessages((prev) =>
          prev.filter((turn) => turn.uuid !== optimisticTurn.uuid)
        );
        setSending(false);
        setError(
          error instanceof Error ? error.message : "Failed to send message"
        );
      }
    },
    [sessionUuid]
  );

  return {
    messages,
    loading,
    sending,
    error,
    stepUpdate,
    sendMessage: handleSendMessage,
    reload: loadMessages,
  };
}
