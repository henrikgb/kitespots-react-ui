import NextAuth, { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID as string,
      name: "Kitespots Login",
    }),
  ],
  secret: process.env.KITESPOTS_SECRET as string,
  pages: {
    signIn: `${process.env.NEXTAUTH_URL}/api/auth/signin`,
  },
};

export default NextAuth(authOptions);
