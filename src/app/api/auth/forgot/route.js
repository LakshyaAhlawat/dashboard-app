import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

export async function POST(request) {
  const { email } = await request.json();

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");
  const users = db.collection("users");
  const resets = db.collection("password_resets");

  const user = await users.findOne({ email });

  if (!user) {
    return Response.json(
      { ok: false, error: "No account exists for this email address." },
      { status: 404 }
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await resets.insertOne({
    userId: user._id,
    email,
    token,
    expiresAt,
    createdAt: new Date(),
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  return Response.json({ ok: true, resetUrl });
}
