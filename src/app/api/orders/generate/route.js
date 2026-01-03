import clientPromise from "@/lib/mongodb";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const CUSTOMERS = [
  "Acme Corp",
  "Northwind",
  "Globex",
  "Umbrella Inc.",
  "Wayne Enterprises",
  "Stark Industries",
];

const CHANNELS = ["Web", "API", "Mobile"];
const STATUSES = ["in_progress", "queued", "completed", "at_risk"];

// Default soft limit to prevent the demo database from growing without bound
const DEFAULT_MAX_ORDERS = 1000;

function randomOf(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (!session.user.id && !session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownerId = session.user.id || session.user.email;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");

  const value = 50000 + Math.floor(Math.random() * 250000); // cents
  const etaMinutes = 5 + Math.floor(Math.random() * 40);
  const status = randomOf(STATUSES);

  const order = {
    ownerId,
    id: randomUUID(),
    customer: randomOf(CUSTOMERS),
    status,
    value,
    channel: randomOf(CHANNELS),
    etaMinutes,
    riskLevel: status === "at_risk" ? "high" : status === "queued" ? "medium" : "low",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const collection = db.collection("orders");
  await collection.insertOne(order);

  // Read config to determine the current maxOrders limit
  const configCollection = db.collection("orders_config");
  const config =
    (await configCollection.findOne({ _id: ownerId })) || {};
  const maxOrders = config.maxOrders || DEFAULT_MAX_ORDERS;

  // Trim oldest orders if we go over the soft limit
  const total = await collection.countDocuments({ ownerId });
  if (total > maxOrders) {
    const excess = total - maxOrders;
    const oldest = await collection
      .find({ ownerId }, { projection: { _id: 1 } })
      .sort({ createdAt: 1 })
      .limit(excess)
      .toArray();

    const idsToDelete = oldest.map((doc) => doc._id);
    if (idsToDelete.length > 0) {
      await collection.deleteMany({ _id: { $in: idsToDelete } });
    }
  }

  return Response.json(order, { status: 201 });
}
