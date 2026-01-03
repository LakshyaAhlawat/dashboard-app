import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

const DB_NAME = process.env.MONGODB_DB || "dashboard";
const MESSAGES = "chat_messages";
const CONVERSATIONS = "chat_conversations";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const messageId = String(body.messageId || "").trim();
  const emoji = String(body.emoji || "").trim();

  if (!messageId || !emoji) {
    return Response.json({ error: "messageId and emoji are required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const messages = db.collection(MESSAGES);
  const conversations = db.collection(CONVERSATIONS);

  const messageDoc = await messages.findOne({ _id: new ObjectId(messageId) });
  if (!messageDoc) {
    return Response.json({ error: "Message not found" }, { status: 404 });
  }

  const conv = await conversations.findOne({ _id: messageDoc.conversationId });
  const currentId = session.user.id || session.user.email;

  if (!conv || !conv.participants?.some((p) => p.id === currentId)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const currentReactions = messageDoc.reactions && typeof messageDoc.reactions === "object"
    ? messageDoc.reactions
    : {};

  const userId = currentId;

  // First remove this user from all emoji arrays so they can only
  // have a single active reaction on this message at any time.
  let hadSameEmojiBefore = false;
  const updatedReactions = Object.fromEntries(
    Object.entries(currentReactions).map(([key, value]) => {
      const arr = Array.isArray(value) ? value : [];
      const filtered = arr.filter((id) => {
        if (id === userId && key === emoji) {
          hadSameEmojiBefore = true;
        }
        return id !== userId;
      });
      return [key, filtered];
    })
  );

  // If the user previously reacted with the same emoji, we've
  // just removed it (toggle off). Otherwise, add their reaction
  // to the chosen emoji.
  if (!hadSameEmojiBefore) {
    const existingForEmoji = Array.isArray(updatedReactions[emoji])
      ? updatedReactions[emoji]
      : [];
    updatedReactions[emoji] = [...existingForEmoji, userId];
  }

  await messages.updateOne(
    { _id: new ObjectId(messageId) },
    { $set: { reactions: updatedReactions } }
  );

  // Return a simplified reactions view: emoji -> { count, users }
  const normalized = Object.fromEntries(
    Object.entries(updatedReactions).map(([key, value]) => [
      key,
      {
        count: Array.isArray(value) ? value.length : 0,
        users: Array.isArray(value) ? value : [],
      },
    ])
  );

  return Response.json({ reactions: normalized });
}
