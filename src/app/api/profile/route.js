import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (!session.user.id && !session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id || session.user.email;
  const email = session.user.email || null;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");
  const profiles = db.collection("profiles");

  const doc = await profiles.findOne({ _id: userId });

  let firstName = doc?.firstName || "";
  let lastName = doc?.lastName || "";
  let avatarDataUrl = doc?.avatarDataUrl || null;
  let displayName =
    doc?.displayName ||
    session.user.name ||
    (email ? email.split("@")[0] : "User");

  if (!firstName && !lastName && displayName) {
    const parts = displayName.trim().split(/\s+/);
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ");
  }

  return Response.json({
    firstName,
    lastName,
    email,
    avatarDataUrl,
    displayName,
  });
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (!session.user.id && !session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id || session.user.email;
  const email = session.user.email || null;

  const { firstName = "", lastName = "", avatarDataUrl = null } =
    await request.json();

  const trimmedFirst = String(firstName).trim();
  const trimmedLast = String(lastName).trim();

  let displayName = `${trimmedFirst} ${trimmedLast}`.trim();
  if (!displayName) {
    displayName =
      session.user.name || (email ? email.split("@")[0] : "User");
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");
  const profiles = db.collection("profiles");

  await profiles.updateOne(
    { _id: userId },
    {
      $set: {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        displayName,
        avatarDataUrl,
        email,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  return Response.json({
    firstName: trimmedFirst,
    lastName: trimmedLast,
    displayName,
    avatarDataUrl,
  });
}
