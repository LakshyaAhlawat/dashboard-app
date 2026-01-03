import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return Response.json({ error: "Token and password are required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");
  const resets = db.collection("password_resets");
  const users = db.collection("users");

  const reset = await resets.findOne({ token });

  if (!reset || !reset.expiresAt || reset.expiresAt < new Date()) {
    return Response.json({ error: "Reset link is invalid or has expired" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await users.updateOne(
    { _id: reset.userId },
    {
      $set: {
        passwordHash,
        updatedAt: new Date(),
      },
    }
  );

  await resets.deleteOne({ _id: reset._id });

  return Response.json({ ok: true });
}
