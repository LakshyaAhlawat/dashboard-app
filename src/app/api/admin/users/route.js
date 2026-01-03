import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");

  // Show only genuine admin-side users (exclude customers)
  const docs = await db
    .collection("users")
    .find({ role: { $ne: "customer" } })
    .project({ _id: 1, name: 1, email: 1, role: 1, disabled: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .toArray();

  const users = docs.map((user) => ({
    id: user._id?.toString(),
    name: user.name || user.email,
    email: user.email,
    role: user.role || "admin",
    disabled: !!user.disabled,
    createdAt: user.createdAt || null,
  }));

  return Response.json(users);
}
