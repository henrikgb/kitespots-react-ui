import NextAuth from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

export const authOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID as string,
      name: "Kitespots Login",
    }),
  ],
}

export default NextAuth(authOptions)