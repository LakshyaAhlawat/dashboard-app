import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const { name, email, password, role } = await request.json();

  if (!email || !password) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "dashboard");
  const users = db.collection("users");

  const existing = await users.findOne({ email });
  if (existing) {
    return Response.json({ error: "User already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email,
    name: name || email.split("@")[0] || "User",
    passwordHash,
    role: role || "admin",
    createdAt: new Date(),
  };

  await users.insertOne(user);

  return Response.json({ ok: true }, { status: 201 });
}
