import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          // Always show the Google account chooser so users can switch emails
          prompt: "select_account",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString();
        const password = credentials?.password?.toString();

        if (!email || !password) {
          return null;
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || "dashboard");
        const users = db.collection("users");

        const user = await users.findOne({ email });
        if (!user || !user.passwordHash) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: user._id?.toString() || email,
          name: user.name || email.split("@")[0] || "User",
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // When a user signs in (credentials, Google, GitHub), ensure we have a Mongo user
      if (user) {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || "dashboard");
        const users = db.collection("users");

        const provider = account?.provider || null;
        const providerAccountId = account?.providerAccountId || null;

        let existing = null;

        // Prefer lookup by email when available
        if (user.email) {
          existing = await users.findOne({ email: user.email });
        }

        // Fallback: lookup by OAuth provider/id (e.g. GitHub with separate id)
        if (!existing && provider && providerAccountId) {
          existing = await users.findOne({
            oauthProvider: provider,
            oauthId: providerAccountId,
          });
        }

        if (!existing) {
          const baseName =
            user.name ||
            (user.email ? user.email.split("@")[0] : null) ||
            "User";

          const doc = {
            email: user.email || null,
            name: baseName,
            role: "admin",
            oauthProvider: provider,
            oauthId: providerAccountId || user.id || null,
            createdAt: new Date(),
          };
          const result = await users.insertOne(doc);
          existing = { _id: result.insertedId, ...doc };
        } else if (provider && providerAccountId) {
          // Ensure OAuth info is synced onto existing user document
          await users.updateOne(
            { _id: existing._id },
            {
              $set: {
                oauthProvider: existing.oauthProvider || provider,
                oauthId: existing.oauthId || providerAccountId,
              },
            }
          );
        }

        token.sub = existing._id?.toString();
        token.role = existing.role || "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
        if (token.role) {
          session.user.role = token.role;
        }
      }
      return session;
    },
  },
};
