import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEFAULT_CONFIG = {
  generationEnabled: true,
  maxOrders: 1000,
};

async function getConfigDoc(ownerId) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");
  const collection = db.collection("orders_config");

  const existing = await collection.findOne({ _id: ownerId });
  if (existing) return existing;

  const doc = { _id: ownerId, ...DEFAULT_CONFIG };
  await collection.insertOne(doc);
  return doc;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (!session.user.id && !session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownerId = session.user.id || session.user.email;
  const config = await getConfigDoc(ownerId);
  return Response.json({
    generationEnabled: config.generationEnabled ?? DEFAULT_CONFIG.generationEnabled,
    maxOrders: config.maxOrders ?? DEFAULT_CONFIG.maxOrders,
  });
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (!session.user.id && !session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownerId = session.user.id || session.user.email;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");
  const collection = db.collection("orders_config");

  const body = await request.json();
  const update = {};

  if (typeof body.generationEnabled === "boolean") {
    update.generationEnabled = body.generationEnabled;
  }
  if (typeof body.maxOrders === "number" && body.maxOrders > 0) {
    update.maxOrders = Math.floor(body.maxOrders);
  }

  if (Object.keys(update).length === 0) {
    return new Response("No valid fields to update", { status: 400 });
  }

  const result = await collection.findOneAndUpdate(
    { _id: ownerId },
    { $set: update },
    { upsert: true, returnDocument: "after" }
  );

  const config = result.value || { _id: ownerId, ...DEFAULT_CONFIG, ...update };

  return Response.json({
    generationEnabled: config.generationEnabled ?? DEFAULT_CONFIG.generationEnabled,
    maxOrders: config.maxOrders ?? DEFAULT_CONFIG.maxOrders,
  });
}
