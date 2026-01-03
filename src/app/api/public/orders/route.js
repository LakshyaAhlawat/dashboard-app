import clientPromise from "@/lib/mongodb";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (!session.user.id && !session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerId = session.user.id || session.user.email;
  const url = new URL(request.url);
  const id = (url.searchParams.get("id") || "").trim();

  if (!id) {
    return Response.json({ error: "Order id is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");

  // First try to find an order that belongs to this customer
  let order = await db.collection("consumer_orders").findOne({ id, customerId });

  // Fallback for legacy orders that may not have customerId stored yet
  if (!order) {
    const legacy = await db.collection("consumer_orders").findOne({ id });
    if (legacy && (!legacy.customerId || legacy.customerId === customerId)) {
      order = legacy;
    }
  }

  if (!order) {
    return Response.json({ error: "No request found for this id." }, { status: 404 });
  }

  return Response.json({
    id: order.id,
    name: order.name,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (!session.user.id && !session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerId = session.user.id || session.user.email;

  const body = await request.json();

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const details = (body.details || "").trim();
  const budget = body.budget !== undefined && body.budget !== null ? Number(body.budget) : null;
  const adminId = body.adminId ? String(body.adminId) : null;
  const adminName = body.adminName ? String(body.adminName) : null;
  const adminEmail = body.adminEmail ? String(body.adminEmail) : null;

  if (!name || !email || !details) {
    return Response.json(
      { error: "Name, email, and order details are required." },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");

  const order = {
    id: randomUUID(),
    customerId,
    name,
    email,
    details,
    budget: Number.isFinite(budget) ? budget : null,
    assignedAdminId: adminId,
    assignedAdminName: adminName,
    assignedAdminEmail: adminEmail,
    status: "pending_review",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.collection("consumer_orders").insertOne(order);

  return Response.json({ ok: true, order }, { status: 201 });
}
