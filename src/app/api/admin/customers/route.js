import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");

  const customers = await db
    .collection("users")
    .find({ role: "customer" })
    .project({ _id: 1, name: 1, email: 1, disabled: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .toArray();

  const result = customers.map((user) => ({
    id: user._id?.toString(),
    name: user.name || user.email,
    email: user.email,
    disabled: !!user.disabled,
    createdAt: user.createdAt || null,
  }));

  return Response.json(result);
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, disabled } = await request.json();

  if (!id) {
    return Response.json({ error: "User id is required." }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");

  await db.collection("users").updateOne(
    { _id: new ObjectId(id) },
    { $set: { disabled: !!disabled } }
  );

  return Response.json({ ok: true });
}
