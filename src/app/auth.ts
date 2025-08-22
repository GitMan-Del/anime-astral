import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase } from "../lib/supabase";
import type { User } from "../types/supabase";
import { generateFriendCode } from '../lib/friendCode';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          type: "email",
          label: "Email",
          placeholder: "johndoe@gmail.com",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", credentials.email)
            .single() as { data: User | null; error: unknown };

          if (error || !user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          if (!user.password_hash || typeof user.password_hash !== "string") {
            console.log("No password hash found for user:", credentials.email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            String(credentials.password),
            user.password_hash
          );

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.email.split("@")[0],
            image: user.avatar_url || "/default-profile.png",
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/api/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile) {
        try {
          const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .single();

          console.log("Google sign-in - User:", user, "Profile:", profile);

          if (!existingUser) {
            // Verifică că user.email există
            if (!user.email) {
              console.error("User email is missing");
              return false;
            }

            // Generează un friend code unic pentru user-ul nou
            let friendCode;
            let isUnique = false;
            
            while (!isUnique) {
              friendCode = generateFriendCode();
              const { data: existingCode } = await supabase
                .from("users")
                .select("id")
                .eq("friend_code", friendCode)
                .single();
              
              if (!existingCode) {
                isUnique = true;
              }
            }

            const { error } = await supabase.from("users").insert({
              email: user.email,
              avatar_url: user.image || profile.picture || "/default-profile.png",
              auth_provider: "google",
              email_verified: true,
              username: user.email.split("@")[0],
              display_name: user.name || user.email.split("@")[0],
              friend_code: friendCode,
            });

            if (error) {
              console.error("Error creating user:", error);
            }
          } else if (existingUser.avatar_url !== user.image && user.image) {
            const { error } = await supabase
              .from("users")
              .update({ avatar_url: user.image })
              .eq("email", user.email);

            if (error) {
              console.error("Error updating user avatar:", error);
            }
          }
        } catch (error) {
          console.error("Error handling Google sign-in:", error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;

        const { data: user } = await supabase
          .from("users")
          .select("avatar_url")
          .eq("id", token.sub)
          .single();

        session.user.image = user?.avatar_url ?? token.picture ?? "/default-profile.png";
      } else {
        console.log("No token.sub found");
        session.user.image = "/default-profile.png";
      }
      return session;
    },
    async jwt({ token, user, profile }) {
      if (user) {
        token.id = user.id;
      }
      if (profile?.picture) {
        token.picture = profile.picture;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`;
      } else if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, account }) {
      console.log("User signed in:", user.email || "No email", "Provider:", account?.provider);
    },
  },
  session: {
    strategy: "jwt",
  },
});