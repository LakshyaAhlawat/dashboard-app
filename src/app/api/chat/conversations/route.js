import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

const DB_NAME = process.env.MONGODB_DB || "dashboard";
const CONVERSATIONS = "chat_conversations";
const USERS = "users";

function normalizeUser(user) {
  if (!user) return null;
  return {
    id: user._id?.toString(),
    name: user.name || user.email?.split("@")[0] || "User",
    email: user.email,
    role: user.role || "admin",
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const userId = session.user.id || session.user.email;

  const docs = await db
    .collection(CONVERSATIONS)
    .find({ "participants.id": userId })
    .sort({ updatedAt: -1 })
    .limit(100)
    .toArray();

  const conversations = docs.map((doc) => ({
    id: doc._id?.toString(),
    participants: doc.participants,
    lastMessage: doc.lastMessage || null,
    updatedAt: doc.updatedAt,
    unreadBy: doc.unreadBy || [],
  }));

  return Response.json({ conversations });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { targetUserId } = body;

  if (!targetUserId) {
    return Response.json({ error: "targetUserId is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const usersCollection = db.collection(USERS);

  let meDoc = null;
  try {
    if (session.user.id) {
      meDoc = await usersCollection.findOne({ _id: new ObjectId(session.user.id) });
    }
    if (!meDoc) {
      meDoc = await usersCollection.findOne({ email: session.user.email });
    }
  } catch {
    meDoc = null;
  }

  let targetDoc = null;
  try {
    targetDoc = await usersCollection.findOne({ _id: new ObjectId(targetUserId) });
  } catch {
    targetDoc = null;
  }

  const me =
    normalizeUser(meDoc) ||
    normalizeUser({
      _id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: "admin",
    });
  const target = normalizeUser(targetDoc);

  if (!target) {
    return Response.json({ error: "Target user not found" }, { status: 404 });
  }

  // Prevent customer-to-customer direct chats
  if (me?.role === "customer" && target.role === "customer") {
    return Response.json({ error: "Customers can only chat with admins" }, { status: 400 });
  }

  const conversationsCollection = db.collection(CONVERSATIONS);

  const existing = await conversationsCollection.findOne({
    $and: [{ "participants.id": me.id }, { "participants.id": target.id }],
  });

  if (existing) {
    return Response.json({
      conversation: {
        id: existing._id?.toString(),
        participants: existing.participants,
        lastMessage: existing.lastMessage || null,
        updatedAt: existing.updatedAt,
      },
    });
  }

  const doc = {
    participants: [
      {
        id: me.id,
        name: me.name,
        email: me.email,
        role: me.role,
      },
      {
        id: target.id,
        name: target.name,
        email: target.email,
        role: target.role,
      },
    ],
    lastMessage: null,
    unreadBy: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await conversationsCollection.insertOne(doc);

  return Response.json({
    conversation: {
      id: result.insertedId.toString(),
      participants: doc.participants,
      lastMessage: null,
      updatedAt: doc.updatedAt,
      unreadBy: [],
    },
  });
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { conversationId, action } = body;

  if (!conversationId || action !== "mark_read") {
    return Response.json({ error: "conversationId and valid action are required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const conversations = db.collection(CONVERSATIONS);

  const currentId = session.user.id || session.user.email;

  const existing = await conversations.findOne({ _id: new ObjectId(conversationId) });
  if (!existing || !existing.participants?.some((p) => p.id === currentId)) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  await conversations.updateOne(
    { _id: new ObjectId(conversationId) },
    { $pull: { unreadBy: currentId } }
  );

  const updated = await conversations.findOne({ _id: new ObjectId(conversationId) });

  return Response.json({
    conversation: {
      id: updated._id?.toString(),
      participants: updated.participants,
      lastMessage: updated.lastMessage || null,
      updatedAt: updated.updatedAt,
      unreadBy: updated.unreadBy || [],
    },
  });
}
