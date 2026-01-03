import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (!session.user.id && !session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");

  const admins = await db
    .collection("users")
    .find({ role: "admin" })
    .project({ _id: 1, name: 1, email: 1 })
    .toArray();

  // Aggregate performance stats per admin from core orders (admin portal)
  const statsRaw = await db
    .collection("orders")
    .aggregate([
      {
        $group: {
          _id: "$ownerId",
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          inProgressOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0],
            },
          },
          queuedOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "queued"] }, 1, 0],
            },
          },
          atRiskOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "at_risk"] }, 1, 0],
            },
          },
        },
      },
    ])
    .toArray();

  const statsByAdminId = new Map(
    statsRaw.map((item) => [String(item._id), item])
  );

  const result = admins.map((admin) => {
    const id = admin._id?.toString() || admin.email;
    const stats = statsByAdminId.get(String(id));

    return {
      id,
      name: admin.name || admin.email,
      email: admin.email,
      stats: {
        totalOrders: stats?.totalOrders || 0,
        completedOrders: stats?.completedOrders || 0,
        inProgressOrders: stats?.inProgressOrders || 0,
        queuedOrders: stats?.queuedOrders || 0,
        atRiskOrders: stats?.atRiskOrders || 0,
      },
    };
  });

  return Response.json(result);
}
