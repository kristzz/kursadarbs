import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Extend the Session type
import { Session } from "next-auth";

// Define custom user type
interface CustomUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Extend session to include our custom user
interface CustomSession extends Session {
  user?: CustomUser;
}

const handler = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This function is called when the user tries to sign in
        // You should use your Laravel API here instead of this dummy implementation
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          // Replace this with your actual API call
          // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
          //   method: 'POST',
          //   body: JSON.stringify(credentials),
          //   headers: { 'Content-Type': 'application/json' }
          // });
          // const user = await res.json();
          
          // PLACEHOLDER: Return dummy user - replace with actual API response
          return { id: "1", name: "User", email: credentials.email };
        } catch (error) {
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user info to token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }): Promise<CustomSession> {
      // Cast the session to our custom type and add user info
      const customSession = session as CustomSession;
      if (customSession.user) {
        customSession.user.id = token.id as string;
      }
      return customSession;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "a-very-secure-secret-that-should-be-in-env",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

export { handler as GET, handler as POST }; 