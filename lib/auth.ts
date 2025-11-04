import jwt, { JwtPayload } from "jsonwebtoken";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret";
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};

export function verifyJWT(token: string): JwtPayload & { id: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    
    if (typeof decoded === "object" && "id" in decoded) {
      return decoded as JwtPayload & { id: string };
    }

    return null;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}
