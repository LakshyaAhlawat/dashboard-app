import clientPromise from "@/lib/mongodb";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (!session.user.id && !session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownerId = session.user.id || session.user.email;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");

  const orders = await db
    .collection("orders")
    .find({ ownerId })
    .sort({ createdAt: -1 })
    .toArray();

  return Response.json(orders);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (!session.user.id && !session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownerId = session.user.id || session.user.email;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");

  const body = await request.json();

  const order = {
    ownerId,
    id: randomUUID(),
    customer: body.customer,
    status: body.status ?? "queued",
    value: body.value ?? 0,
    currency: body.currency ?? "USD",
    channel: body.channel ?? "Web",
    etaMinutes: body.etaMinutes ?? null,
    riskLevel: body.riskLevel ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.collection("orders").insertOne(order);

  return Response.json(order, { status: 201 });
}
