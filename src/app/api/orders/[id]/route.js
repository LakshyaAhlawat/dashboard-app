import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (!session.user.id && !session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownerId = session.user.id || session.user.email;
  const { id } = params;
  const updates = await request.json();

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");

  const result = await db
    .collection("orders")
    .findOneAndUpdate(
      { id, ownerId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

  if (!result.value) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  return Response.json(result.value);
}
