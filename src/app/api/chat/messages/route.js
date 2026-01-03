import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

const DB_NAME = process.env.MONGODB_DB || "dashboard";
const COLLECTION = "chat_messages";
const CONVERSATIONS = "chat_conversations";

function formatMessage(doc) {
  return {
    id: doc._id?.toString(),
    conversationId: doc.conversationId?.toString?.() || doc.conversationId,
    senderId: doc.senderId,
    senderName: doc.senderName,
    senderRole: doc.senderRole,
    text: doc.text,
    attachment: doc.attachment || null,
    reactions: doc.reactions || {},
    createdAt: doc.createdAt,
  };
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const conversationId = (url.searchParams.get("conversationId") || "").trim();

  if (!conversationId) {
    return Response.json({ error: "conversationId is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION);

  const conv = await db
    .collection(CONVERSATIONS)
    .findOne({ _id: new ObjectId(conversationId) });

  const currentId = session.user.id || session.user.email;
  if (!conv || !conv.participants?.some((p) => p.id === currentId)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const docs = await collection
    .find({ conversationId: new ObjectId(conversationId) })
    .sort({ createdAt: 1 })
    .limit(500)
    .toArray();

  return Response.json({ messages: docs.map(formatMessage) });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const text = String(body.text || "").trim();
  const conversationId = String(body.conversationId || "").trim();
  const attachment = body.attachment && typeof body.attachment === "object" ? body.attachment : null;

  if (!conversationId) {
    return Response.json({ error: "conversationId is required" }, { status: 400 });
  }

  if (!text && !attachment) {
    return Response.json({ error: "Text or attachment is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const conversations = db.collection(CONVERSATIONS);
  const existingConv = await conversations.findOne({ _id: new ObjectId(conversationId) });
  const currentId = session.user.id || session.user.email;
  if (!existingConv || !existingConv.participants?.some((p) => p.id === currentId)) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  const collection = db.collection(COLLECTION);

  const doc = {
    conversationId: new ObjectId(conversationId),
    senderId: currentId,
    senderName: session.user.name || session.user.email,
    senderRole:
      existingConv.participants.find((p) => p.id === currentId)?.role || "admin",
    text,
    attachment,
    reactions: {},
    createdAt: new Date(),
  };

  const result = await collection.insertOne(doc);

  const recipientIds = (existingConv.participants || [])
    .map((p) => p.id)
    .filter((id) => id && id !== currentId);

  await conversations.updateOne(
    { _id: new ObjectId(conversationId) },
    {
      $set: {
        lastMessage: {
          text: doc.text,
          attachment: doc.attachment || null,
          senderName: doc.senderName,
          createdAt: doc.createdAt,
          senderRole: doc.senderRole,
        },
        updatedAt: doc.createdAt,
      },
      $addToSet: { unreadBy: { $each: recipientIds } },
    }
  );

  return Response.json({ message: formatMessage({ _id: result.insertedId, ...doc }) });
}

