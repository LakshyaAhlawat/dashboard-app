import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (!session.user.id && !session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerId = session.user.id || session.user.email;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");

  const orders = await db
    .collection("consumer_orders")
    .find({ $or: [{ customerId }, { customerId: { $exists: false } }] })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  return Response.json(orders);
}
