import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request, context) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (!session.user.id && !session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerId = session.user.id || session.user.email;
  const url = new URL(request.url);
  const idFromPath = context?.params?.id;
  const idFromQuery = url.searchParams.get("id");
  const id = (idFromPath || idFromQuery || "").trim();

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
