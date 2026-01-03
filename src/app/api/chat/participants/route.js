import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

const DB_NAME = process.env.MONGODB_DB || "dashboard";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const usersCollection = db.collection("users");
  const currentId = session.user.id || session.user.email;

  // Find current user's role (by id first, then email)
  let meDoc = null;
  try {
    if (session.user.id) {
      meDoc = await usersCollection.findOne({ _id: new ObjectId(session.user.id) });
    }
  } catch {
    meDoc = null;
  }

  if (!meDoc) {
    meDoc = await usersCollection.findOne({ email: session.user.email }).catch(() => null);
  }

  const meRole = meDoc?.role;

  const baseQuery = meRole === "customer"
    ? { role: "admin" }
    : { $or: [{ role: "admin" }, { role: "customer" }] };

  const docs = await usersCollection
    .find(baseQuery)
    .project({ name: 1, email: 1, role: 1 })
    .toArray();

  const users = docs
    .map((u) => ({
      id: u._id?.toString(),
      name: u.name || u.email?.split("@")[0] || "User",
      email: u.email,
      role: u.role || "admin",
    }))
    .filter((u) => u.id !== currentId);

  return Response.json({ users });
}
