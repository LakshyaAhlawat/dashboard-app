import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminId = session.user.id || session.user.email;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");

  const orders = await db
    .collection("consumer_orders")
    .find({
      $or: [
        { assignedAdminId: adminId },
        { assignedAdminId: { $exists: false } },
        { "reassignment.toAdminId": adminId },
        { "reassignment.fromAdminId": adminId },
      ],
    })
    .sort({ createdAt: -1 })
    .toArray();

  return Response.json(orders);
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    id,
    status,
    details,
    assignedAdminId,
    assignedAdminName,
    assignedAdminEmail,
    reassignmentRequest,
    reassignmentDecision,
  } = body;

  if (!id) {
    return Response.json({ error: "Order id is required." }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");

  const collection = db.collection("consumer_orders");

  const existing = await collection.findOne({ id });
  if (!existing) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  const now = new Date();
  const update = {
    updatedAt: now,
  };

  if (status) {
    update.status = status;
  }

  if (typeof details === "string" && details.trim()) {
    update.details = details.trim();
  }

  // Start a reassignment request (outgoing from current admin)
  if (reassignmentRequest && assignedAdminId) {
    update.reassignment = {
      fromAdminId: existing.assignedAdminId || session.user.id || session.user.email,
      fromAdminName: existing.assignedAdminName || session.user.name || session.user.email,
      toAdminId: assignedAdminId,
      toAdminName: assignedAdminName || assignedAdminId,
      toAdminEmail: assignedAdminEmail || null,
      status: "pending",
      createdAt: now,
    };
  }

  // Handle decision on an incoming reassignment request by target admin
  if (reassignmentDecision === "accept" || reassignmentDecision === "decline") {
    const currentId = session.user.id || session.user.email;
    if (!existing.reassignment || existing.reassignment.toAdminId !== currentId) {
      return Response.json({ error: "No pending reassignment for this admin" }, { status: 400 });
    }

    if (reassignmentDecision === "accept") {
      update.assignedAdminId = existing.reassignment.toAdminId;
      update.assignedAdminName = existing.reassignment.toAdminName;
      update.assignedAdminEmail = existing.reassignment.toAdminEmail;
      update.reassignment = {
        ...existing.reassignment,
        status: "accepted",
        decidedAt: now,
      };
    } else {
      update.reassignment = {
        ...existing.reassignment,
        status: "declined",
        decidedAt: now,
      };
    }
  }

  // If only status/details updated and there is no reassignment payload, keep existing assignee
  if (!reassignmentRequest && !reassignmentDecision && !assignedAdminId && !assignedAdminName && !assignedAdminEmail && status && !existing.assignedAdminId) {
    update.assignedAdminId = session.user.id || session.user.email;
    update.assignedAdminName = session.user.name || session.user.email;
    update.assignedAdminEmail = session.user.email;
  }

  await collection.updateOne({ id }, { $set: update });

  const updated = await collection.findOne({ id });

  return Response.json(updated || { ok: true });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = (url.searchParams.get("id") || "").trim();

  if (!id) {
    return Response.json({ error: "Order id is required." }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");

  await db.collection("consumer_orders").deleteOne({ id });

  return Response.json({ ok: true });
}
