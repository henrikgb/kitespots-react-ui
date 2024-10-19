import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { JWT } from "next-auth/jwt"; // Import the JWT type

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID as string,
      name: "Kitespots Login",
    }),
  ],
  session: {
    strategy: "jwt", // Optional, depending on your needs
  },
  callbacks: {
    async jwt({ token, account }): Promise<JWT> {
      // Custom token logic if needed
      return token;
    },
    async session({ session, token }): Promise<Session> {
      // Custom session logic if needed
      return session;
    },
  },
  pages: {
    error: '/auth/error', // Redirect here on error
  },
  debug: true,
};

export default NextAuth(authOptions);
