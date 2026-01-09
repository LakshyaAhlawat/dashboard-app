"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/ToastProvider";

function formatTimestamp(dateLike) {
  if (!dateLike) return "";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "";
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default function ChatClientClean() {
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [input, setInput] = useState("");
  const [attachmentPreviews, setAttachmentPreviews] = useState([]); // { id, type, name, url, file?, status }
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogScope, setDeleteDialogScope] = useState(null); // "me" | "everyone" | null

  const reactionOptions = ["👍", "❤️", "😄", "🎉"];

  const currentUserId = session?.user?.id || session?.user?.email;

  useEffect(() => {
    if (!session?.user) return;

    async function loadInitial() {
      try {
        const [convRes, usersRes] = await Promise.all([
          fetch("/api/chat/conversations"),
          fetch("/api/chat/participants"),
        ]);

        if (convRes.ok) {
          const data = await convRes.json();
          setConversations(data.conversations || []);
          if (!activeConversationId && data.conversations?.length) {
            setActiveConversationId(data.conversations[0].id);
          }
        }

        if (usersRes.ok) {
          const data = await usersRes.json();
          setParticipants(data.users || []);
        }
      } catch (error) {
        console.error("Failed to load chat data", error);
      }
    }

    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]);

  useEffect(() => {
    if (!activeConversationId) return;

    let cancelled = false;

    async function loadMessages() {
      try {
        const res = await fetch(
          `/api/chat/messages?conversationId=${encodeURIComponent(activeConversationId)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error("Failed to load chat messages", error);
      }
    }

    loadMessages();

    fetch("/api/chat/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeConversationId, action: "mark_read" }),
    }).catch(() => {});

    const interval = setInterval(loadMessages, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeConversationId]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  const activeOtherUser = useMemo(() => {
    if (!activeConversation) return null;
    const currentId = currentUserId;
    return (
      activeConversation.participants.find((p) => p.id !== currentId) ||
      activeConversation.participants[0] ||
      null
    );
  }, [activeConversation, currentUserId]);

  const unreadFromCustomers = useMemo(() => {
    if (!currentUserId) return 0;
    return conversations.filter((conv) => {
      const other = conv.participants.find((p) => p.id !== currentUserId);
      const isCustomer = other?.role === "customer";
      const hasUnread = (conv.unreadBy || []).includes(currentUserId);
      return isCustomer && hasUnread;
    }).length;
  }, [conversations, currentUserId]);

  function toggleSelectMessage(messageId) {
    setSelectedMessageIds((current) => {
      if (!selectionMode) return current;
      return current.includes(messageId)
        ? current.filter((id) => id !== messageId)
        : current.concat(messageId);
    });
  }

  function clearSelection() {
    setSelectionMode(false);
    setSelectedMessageIds([]);
  }

  async function handleDeleteSelected(scope) {
    if (!activeConversationId || !selectedMessageIds.length || isDeleting) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          messageIds: selectedMessageIds,
          scope,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast({
          title: "Could not delete messages",
          description: data.error || "Please try again in a moment.",
          variant: "error",
        });
        setIsDeleting(false);
        return;
      }

      setMessages((current) => {
        if (scope === "everyone") {
          return current.map((m) =>
            selectedMessageIds.includes(m.id)
              ? { ...m, text: "", attachment: null, deletedForAll: true }
              : m
          );
        }
        return current.filter((m) => !selectedMessageIds.includes(m.id));
      });
      clearSelection();
    } catch (error) {
      console.error("Failed to delete messages", error);
      showToast({
        title: "Could not delete messages",
        description: "Please try again in a moment.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function toggleReaction(messageId, emoji) {
    try {
      const res = await fetch("/api/chat/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, emoji }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages((current) =>
        current.map((m) =>
          m.id === messageId
            ? {
                ...m,
                reactions: data.reactions,
              }
            : m
        )
      );
    } catch (error) {
      console.error("Failed to toggle reaction", error);
    }
  }

  async function handleSend(event) {
    event.preventDefault();

    const text = (input || "").trim();
    const hasText = Boolean(text);
    const hasAttachments = attachmentPreviews.length > 0;

    if (isSending || uploadingAttachments) return;

    if (!activeConversationId) {
      showToast({
        title: "No conversation selected",
        description: "Please pick a conversation before sending.",
        variant: "error",
      });
      return;
    }

    if (!hasText && !hasAttachments) return;

    // First upload all attachments if needed
    let finalAttachments = attachmentPreviews;
    if (hasAttachments) {
      setUploadingAttachments(true);
      try {
        const updated = [];
        for (const att of attachmentPreviews) {
          if (att.url && !att.file) {
            updated.push(att);
            continue;
          }
          if (!att.file) {
            updated.push(att);
            continue;
          }
          const form = new FormData();
          form.append("file", att.file);
          const uploadRes = await fetch("/api/chat/upload", {
            method: "POST",
            body: form,
          });
          if (!uploadRes.ok) {
            throw new Error("Upload failed");
          }
          const uploadData = await uploadRes.json();
          if (!uploadData?.url) {
            throw new Error("Upload failed");
          }
          updated.push({
            ...att,
            url: uploadData.url,
            status: "uploaded",
          });
        }
        finalAttachments = updated;
        setAttachmentPreviews(updated);
      } catch (error) {
        console.error("Failed to upload attachments", error);
        showToast({
          title: "Could not upload files",
          description: "Please try again or remove the attachments.",
          variant: "error",
        });
        setUploadingAttachments(false);
        return;
      }
      setUploadingAttachments(false);
    }

    const attachmentPayloads = finalAttachments
      .filter((att) => att.url)
      .map((att) => ({ type: att.type, name: att.name, url: att.url }));

    const payloads = [];

    if (hasText && attachmentPayloads.length === 0) {
      payloads.push({ text, attachment: null });
    } else if (hasText && attachmentPayloads.length > 0) {
      payloads.push({ text, attachment: attachmentPayloads[0] });
      for (let i = 1; i < attachmentPayloads.length; i += 1) {
        payloads.push({ text: "", attachment: attachmentPayloads[i] });
      }
    } else if (!hasText && attachmentPayloads.length > 0) {
      for (const att of attachmentPayloads) {
        payloads.push({ text: "", attachment: att });
      }
    }

    if (!payloads.length) return;

    setIsSending(true);

    try {
      for (const payload of payloads) {
        const optimisticId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;

        const optimisticMessage = {
          id: optimisticId,
          conversationId: activeConversationId,
          senderId: currentUserId,
          senderName: session?.user?.name || session?.user?.email,
          senderRole: "admin",
          text: payload.text,
          attachment: payload.attachment,
          createdAt: new Date().toISOString(),
          sending: true,
        };

        setMessages((current) => current.concat(optimisticMessage));

        const res = await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: activeConversationId,
            text: payload.text,
            attachment: payload.attachment,
          }),
        });
        if (!res.ok) {
          throw new Error("Failed to send message");
        }
        const data = await res.json();
        setMessages((current) =>
          current
            .filter((m) => m.id !== optimisticId)
            .concat(data.message)
        );
      }

      // Clean up previews
      finalAttachments.forEach((att) => {
        if (att.file && att.url && typeof att.url === "string" && att.url.startsWith("blob:")) {
          URL.revokeObjectURL(att.url);
        }
      });

      setInput("");
      setAttachmentPreviews([]);
      setIsSending(false);
    } catch (error) {
      console.error("Failed to send chat message", error);
      showToast({
        title: "Message not sent",
        description: "Please try again in a moment.",
        variant: "error",
      });
      setIsSending(false);
    }
  }

  return (
    <div className="flex min-h-105 flex-1 flex-col gap-4">
      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-50 md:text-lg">Live chat</h1>
            <p className="text-xs text-slate-400 md:text-sm">
              Real-time capable customer chat. Currently using local state only.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              WebSocket-ready
            </span>
          </div>
        </div>
      </section>

      <section className="flex flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-lg shadow-slate-950/60">
        {/* Left: conversations and people list */}
        <div className="hidden w-60 shrink-0 border-r border-slate-800 bg-slate-950/80 px-2 py-3 text-xs text-slate-300 sm:flex sm:flex-col">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Conversations
            </p>
            {unreadFromCustomers > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {unreadFromCustomers} new
              </span>
            )}
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto pr-1">
            {conversations.map((conv) => {
              const other =
                (conv.participants || []).find((p) => p.id !== currentUserId) ||
                conv.participants?.[0];
              const isActive = conv.id === activeConversationId;
              const last = conv.lastMessage;
              const hasUnread = (conv.unreadBy || []).includes(currentUserId);
              const isCustomer = other?.role === "customer";
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`flex w-full flex-col rounded-xl px-2.5 py-2 text-left transition-colors ${
                    isActive
                      ? "bg-sky-500/10 ring-1 ring-sky-500/40"
                      : "hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-tr from-sky-500 to-indigo-500 text-[10px] font-semibold text-white">
                      {(other?.name || other?.email || "?")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-medium text-slate-100">
                        {other?.name || other?.email || "Conversation"}
                      </p>
                      {last && (
                        <p className="truncate text-[10px] text-slate-400">
                          {last.text || (last.attachment ? last.attachment.name : "Attachment")}
                        </p>
                      )}
                    </div>
                    {hasUnread && (
                      <span
                        className={`ml-auto inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                          isCustomer
                            ? "bg-emerald-500/20 text-emerald-200"
                            : "bg-sky-500/20 text-sky-200"
                        }`}
                      >
                        {isCustomer ? "New from customer" : "New"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 border-t border-slate-800 pt-2 text-[11px] text-slate-400">
            <p className="mb-1 font-semibold text-slate-300">People</p>
            <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
              {participants.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/chat/conversations", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ targetUserId: user.id }),
                      });
                      const data = await res.json();
                      if (!res.ok) return;
                      setConversations((current) => {
                        const exists = current.find((c) => c.id === data.conversation.id);
                        if (exists) return current;
                        return [data.conversation, ...current];
                      });
                      setActiveConversationId(data.conversation.id);
                    } catch (error) {
                      console.error("Failed to start conversation", error);
                    }
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] text-slate-200 hover:bg-slate-900/80"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-slate-100">
                    {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="truncate">
                    {user.name || user.email}
                    <span className="ml-1 text-[10px] lowercase text-slate-500">· {user.role}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: active conversation */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-linear-to-tr from-sky-500 to-indigo-500" />
              <div>
                <p className="text-xs font-medium text-slate-100">
                  {activeOtherUser?.name || activeOtherUser?.email || "Choose a conversation"}
                </p>
                <p className="text-[11px] text-slate-400">
                  {activeOtherUser
                    ? `${activeOtherUser.role === "admin" ? "Admin" : "Customer"} chat`
                    : "Pick someone on the left to start chatting"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectionMode && (
                <div className="flex items-center gap-2 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-sky-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>Selection mode · {selectedMessageIds.length} selected</span>
                </div>
              )}
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-200 hover:border-sky-500 hover:text-sky-100 sm:hidden"
                onClick={() => setIsMobileListOpen(true)}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                Chats
              </button>
              <button
                type="button"
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-colors ${
                  selectionMode
                    ? "border-sky-400 bg-sky-500/10 text-sky-100"
                    : "border-slate-700 bg-slate-900 text-slate-200 hover:border-sky-500 hover:text-sky-100"
                }`}
                onClick={() => {
                  if (selectionMode) {
                    clearSelection();
                  } else {
                    setSelectionMode(true);
                  }
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                {selectionMode ? "Cancel" : "Select"}
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
            {messages.map((message) => {
              const fromMe = message.senderId === currentUserId;
              const timestamp = formatTimestamp(message.createdAt);
              const rawReactions = message.reactions && typeof message.reactions === "object"
                ? message.reactions
                : {};

              const reactionsForMessage = Object.fromEntries(
                Object.entries(rawReactions).map(([emoji, value]) => {
                  if (value && typeof value === "object" && "count" in value) {
                    return [emoji, value];
                  }
                  const list = Array.isArray(value) ? value : [];
                  return [emoji, { count: list.length, users: list }];
                })
              );

              const activeReactionEmojis = Object.keys(reactionsForMessage).filter((emoji) => {
                const info = reactionsForMessage[emoji];
                const users = Array.isArray(info?.users) ? info.users : [];
                return users.length > 0;
              });

              const deletedForAll = Boolean(message.deletedForAll);
              const isSelected = selectedMessageIds.includes(message.id);

              return (
                <div
                  key={message.id}
                  className={`flex ${fromMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    onClick={() => {
                      if (selectionMode) toggleSelectMessage(message.id);
                    }}
                    className={`max-w-[75%] cursor-default rounded-2xl px-3 py-2 text-xs sm:max-w-[60%] sm:px-3.5 sm:py-2.5 sm:text-sm ${
                      fromMe
                        ? "rounded-br-md bg-sky-600 text-slate-50"
                        : "rounded-bl-md bg-slate-900 text-slate-100"
                    } ${
                      selectionMode && isSelected
                        ? "ring-2 ring-sky-300 ring-offset-2 ring-offset-slate-950"
                        : ""
                    }`}
                  >
                    <p className="mb-0.5 flex items-center gap-1 text-[11px] font-medium text-slate-100">
                      <span>{message.senderName}</span>
                      <span className="rounded-full bg-slate-950/40 px-1.5 py-0.5 text-[9px] font-normal text-slate-300">
                        {fromMe ? "You" : message.senderRole}
                      </span>
                      {message.sending && (
                        <span className="text-[9px] font-normal text-slate-300 animate-pulse">
                          Sending…
                        </span>
                      )}
                    </p>
                    {deletedForAll ? (
                      <p className="mt-0.5 text-[11px] italic text-slate-200/80 sm:text-xs">
                        This message was deleted for everyone.
                      </p>
                    ) : (
                      <>
                        {message.text && (
                          <p className="text-[11px] leading-relaxed sm:text-xs">{message.text}</p>
                        )}
                        {message.attachment && message.attachment.type === "image" && (
                          <div className="mt-1 overflow-hidden rounded-lg border border-slate-800 bg-slate-950/80">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={message.attachment.url}
                              alt={message.attachment.name || "Image"}
                              className="max-h-64 w-full object-cover"
                            />
                          </div>
                        )}
                        {message.attachment && message.attachment.type === "file" && (
                          (() => {
                            const url = message.attachment.url || "";
                            const isBlobUrl =
                              typeof url === "string" && url.startsWith("blob:");

                            if (isBlobUrl) {
                              return (
                                <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-950/80 px-2 py-1 text-[11px] text-amber-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                  <span>
                                    Attachment not available. Ask the sender to resend.
                                  </span>
                                </span>
                              );
                            }

                            return (
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-950/80 px-2 py-1 text-[11px] text-sky-200 hover:text-sky-100"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                                <span>
                                  {message.attachment.name || "Download attachment"}
                                </span>
                              </a>
                            );
                          })()
                        )}
                        <p className="mt-1 text-[10px] text-slate-200/80">{timestamp}</p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1">
                            {reactionOptions.map((emoji) => {
                              const usersForEmoji = Array.isArray(
                                reactionsForMessage[emoji]?.users
                              )
                                ? reactionsForMessage[emoji].users
                                : [];
                              const isActive = usersForEmoji.includes(currentUserId);
                              return (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => toggleReaction(message.id, emoji)}
                                  className={`rounded-full px-1.5 py-0.5 text-[11px] transition-colors ${
                                    isActive
                                      ? "bg-slate-950/80 text-amber-200"
                                      : "bg-slate-950/40 text-slate-300 hover:bg-slate-900/80"
                                  }`}
                                >
                                  {emoji}
                                </button>
                              );
                            })}
                          </div>
                          {activeReactionEmojis.length > 0 && (
                            <div className="flex items-center gap-1 rounded-full bg-slate-950/40 px-1.5 py-0.5 text-[10px] text-slate-200">
                              {activeReactionEmojis.map((emoji) => {
                                const count = reactionsForMessage[emoji]?.count || 0;
                                return (
                                  <span key={emoji} className="flex items-center gap-0.5">
                                    <span>{emoji}</span>
                                    {count > 1 && (
                                      <span className="text-[9px] text-slate-300">{count}</span>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {!messages.length && (
              <div className="flex h-full items-center justify-center text-center text-[11px] text-slate-500">
                <p>
                  {activeConversation
                    ? "No messages yet. Say hi to start the conversation."
                    : "Select a person on the left or start a new chat."}
                </p>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="border-t border-slate-800 bg-slate-950/90 px-3 py-2.5 sm:px-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 sm:max-w-xs sm:shrink-0">
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-slate-700 px-2 py-1 hover:border-sky-500/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>Attach</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const files = Array.from(event.target.files || []);
                      if (!files.length) return;
                      setAttachmentPreviews((current) => {
                        const next = [...current];
                        for (const file of files) {
                          const isImage = file.type.startsWith("image/");
                          const url = URL.createObjectURL(file);
                          next.push({
                            id: `${Date.now()}-${file.name}-${Math.random()
                              .toString(16)
                              .slice(2)}`,
                            type: isImage ? "image" : "file",
                            name: file.name,
                            url,
                            file,
                            status: "pending",
                          });
                        }
                        return next;
                      });
                      event.target.value = "";
                    }}
                  />
                </label>
                {uploadingAttachments && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-sky-200">
                    <span className="h-3 w-3 animate-spin rounded-full border border-sky-400/70 border-t-transparent" />
                    Uploading files…
                  </span>
                )}
                {attachmentPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {attachmentPreviews.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-200"
                      >
                        {att.type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={att.url}
                            alt={att.name || "Preview"}
                            className="h-6 w-6 rounded object-cover"
                          />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                        )}
                        <span className="max-w-36 truncate">{att.name}</span>
                        <span className="text-[9px] text-slate-400">
                          {att.status === "uploaded"
                            ? "Ready"
                            : att.status === "uploading"
                            ? "Uploading…"
                            : "Will upload on send"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachmentPreviews((current) => {
                              current.forEach((item) => {
                                if (
                                  item.id === att.id &&
                                  item.url &&
                                  typeof item.url === "string" &&
                                  item.url.startsWith("blob:")
                                ) {
                                  URL.revokeObjectURL(item.url);
                                }
                              });
                              return current.filter((item) => item.id !== att.id);
                            });
                          }}
                          className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-200 hover:bg-slate-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 sm:flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type a message…"
                  disabled={isSending}
                  className="flex-1 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={isSending || uploadingAttachments || (!input.trim() && !attachmentPreviews.length)}
                  className="inline-flex items-center justify-center rounded-full bg-sky-500 px-3 py-2 text-xs font-medium text-white shadow-md shadow-sky-500/40 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm"
                >
                  {isSending ? (
                    <span className="flex items-center gap-1">
                      <span className="h-3 w-3 animate-spin rounded-full border border-slate-100/40 border-t-transparent" />
                      <span>
                        {attachmentPreviews.length ? "Sending messages…" : "Sending…"}
                      </span>
                    </span>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
              {selectionMode && selectedMessageIds.length > 0 && (
                <div className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/90 p-2 text-[10px] text-slate-200">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">Selected messages ({selectedMessageIds.length})</span>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-slate-800"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="mt-1 max-h-24 space-y-1 overflow-y-auto">
                    {messages
                      .filter((m) => selectedMessageIds.includes(m.id))
                      .map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between gap-2 rounded-xl bg-slate-900 px-2 py-1"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[10px] font-medium text-slate-100">
                              {m.senderName}
                            </p>
                            <p className="truncate text-[10px] text-slate-400">
                              {m.text ||
                                (m.attachment
                                  ? m.attachment.name || "Attachment"
                                  : "(no text)" )}
                            </p>
                          </div>
                          <span className="text-[9px] text-slate-500">
                            {formatTimestamp(m.createdAt)}
                          </span>
                        </div>
                      ))}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setDeleteDialogScope("me")}
                      className="rounded-full bg-slate-900 px-2 py-0.5 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete for me
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setDeleteDialogScope("everyone")}
                      className="rounded-full bg-red-600/80 px-2 py-0.5 text-slate-50 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete for everyone
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
          {deleteDialogScope && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950/95 p-5 text-xs text-slate-200 shadow-xl shadow-slate-950/80">
                <div className="mb-3 flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
                    !
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-50">
                      {deleteDialogScope === "everyone"
                        ? "Delete for everyone?"
                        : "Delete for you only?"}
                    </h2>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {deleteDialogScope === "everyone"
                        ? "This will replace the selected messages with a deleted notice for all participants. You can’t undo this."
                        : "The selected messages will disappear from your view, but others may still see them."}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDeleteDialogScope(null)}
                    className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 hover:bg-slate-800"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={async () => {
                      const scope = deleteDialogScope;
                      if (!scope) return;
                      await handleDeleteSelected(scope);
                      setDeleteDialogScope(null);
                    }}
                    className="rounded-full bg-red-600/90 px-3 py-1.5 text-slate-50 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isDeleting ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile conversations & people sheet */}
      {isMobileListOpen && (
        <div className="pointer-events-none fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm sm:hidden">
          <div className="pointer-events-auto absolute inset-y-0 left-0 flex w-72 max-w-full flex-col border-r border-slate-800 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 text-[11px] text-slate-300">
              <p className="font-semibold uppercase tracking-wide">Chats</p>
              <button
                type="button"
                className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-200 hover:bg-slate-800"
                onClick={() => setIsMobileListOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2 text-xs text-slate-300">
              <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Conversations
              </p>
              <div className="space-y-1 pb-2 pr-1">
                {conversations.map((conv) => {
                  const currentId = currentUserId;
                  const other =
                    (conv.participants || []).find((p) => p.id !== currentId) ||
                    conv.participants?.[0];
                  const isActive = conv.id === activeConversationId;
                  const last = conv.lastMessage;
                  const hasUnread = (conv.unreadBy || []).includes(currentId);
                  const isCustomer = other?.role === "customer";
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => {
                        setActiveConversationId(conv.id);
                        setIsMobileListOpen(false);
                      }}
                      className={`flex w-full flex-col rounded-xl px-2.5 py-2 text-left transition-colors ${
                        isActive
                          ? "bg-sky-500/10 ring-1 ring-sky-500/40"
                          : "hover:bg-slate-900/80"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-tr from-sky-500 to-indigo-500 text-[10px] font-semibold text-white">
                          {(other?.name || other?.email || "?")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-medium text-slate-100">
                            {other?.name || other?.email || "Conversation"}
                          </p>
                          {last && (
                            <p className="truncate text-[10px] text-slate-400">
                              {last.text ||
                                (last.attachment ? last.attachment.name : "Attachment")}
                            </p>
                          )}
                        </div>
                        {hasUnread && (
                          <span
                            className={`ml-auto inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                              isCustomer
                                ? "bg-emerald-500/20 text-emerald-200"
                                : "bg-sky-500/20 text-sky-200"
                            }`}
                          >
                            {isCustomer ? "New from customer" : "New"}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="mb-1 mt-2 px-1 text-[11px] font-semibold text-slate-400">
                People
              </p>
              <div className="space-y-1 pb-4 pr-1">
                {participants.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/chat/conversations", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ targetUserId: user.id }),
                        });
                        const data = await res.json();
                        if (!res.ok) return;
                        setConversations((current) => {
                          const exists = current.find((c) => c.id === data.conversation.id);
                          if (exists) return current;
                          return [data.conversation, ...current];
                        });
                        setActiveConversationId(data.conversation.id);
                        setIsMobileListOpen(false);
                      } catch (error) {
                        console.error("Failed to start conversation", error);
                      }
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] text-slate-200 hover:bg-slate-900/80"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-slate-100">
                      {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
                    </span>
                    <span className="truncate">
                      {user.name || user.email}
                      <span className="ml-1 text-[10px] lowercase text-slate-500">· {user.role}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
