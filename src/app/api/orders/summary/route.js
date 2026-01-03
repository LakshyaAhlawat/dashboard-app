import clientPromise from "@/lib/mongodb";
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
  const orders = db.collection("orders");

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const baseFilter = { ownerId };

  const [totalOrders, activeOrders, atRiskCount, todayOrders] = await Promise.all([
    orders.countDocuments(baseFilter),
    orders.countDocuments({ ...baseFilter, status: { $in: ["in_progress", "queued", "at_risk"] } }),
    orders.countDocuments({ ...baseFilter, status: "at_risk" }),
    orders.countDocuments({ ...baseFilter, createdAt: { $gte: startOfDay } }),
  ]);

  const revenueAgg = await orders
    .aggregate([
      { $match: { ...baseFilter, createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$value" } } },
    ])
    .toArray();

  const etaAgg = await orders
    .aggregate([
      { $match: { ...baseFilter, etaMinutes: { $ne: null } } },
      { $group: { _id: null, avgEta: { $avg: "$etaMinutes" } } },
    ])
    .toArray();

  const statusAgg = await orders
    .aggregate([
      { $match: baseFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])
    .toArray();

  const channelAgg = await orders
    .aggregate([
      { $match: baseFilter },
      { $group: { _id: "$channel", count: { $sum: 1 } } },
    ])
    .toArray();

  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  const hourlyAgg = await orders
    .aggregate([
      { $match: { ...baseFilter, createdAt: { $gte: twelveHoursAgo } } },
      // Group by UTC hour so we can label consistently on the client
      { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
    ])
    .toArray();

  const hourlyOrders = [];
  for (let i = 11; i >= 0; i--) {
    const pointTime = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = pointTime.getUTCHours();
    const label = `${hour.toString().padStart(2, "0")}:00`;
    const bucket = hourlyAgg.find((entry) => entry._id === hour);
    hourlyOrders.push({
      label,
      count: bucket ? bucket.count : 0,
    });
  }

  const recentOrders = await orders
    .find(
      baseFilter,
      {
        projection: {
          _id: 0,
          id: 1,
          customer: 1,
          status: 1,
          value: 1,
          currency: 1,
          channel: 1,
          etaMinutes: 1,
          createdAt: 1,
        },
      }
    )
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  const todayRevenueMinor = revenueAgg[0]?.total ?? 0;
  const avgEta = etaAgg[0]?.avgEta ?? null;
  const avgOrderValueMinor = todayOrders > 0 ? todayRevenueMinor / todayOrders : 0;

  const statusBreakdown = statusAgg.map((entry) => ({
    status: entry._id ?? "unknown",
    count: entry.count,
  }));

  const channelBreakdown = channelAgg.map((entry) => ({
    channel: entry._id ?? "Unknown",
    count: entry.count,
  }));

  return Response.json({
    totalOrders,
    activeOrders,
    atRiskCount,
    todayRevenueMinor,
    avgEtaMinutes: avgEta,
    todayOrders,
    avgOrderValueMinor,
    statusBreakdown,
    channelBreakdown,
    hourlyOrders,
    recentOrders,
  });
}
