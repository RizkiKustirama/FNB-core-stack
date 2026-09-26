import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Ensure AUTH_SECRET is always present in process.env for NextAuth v5 core
if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET || 'fnb-pos-super-secret-key-change-in-prod';
}

const secretKey = process.env.AUTH_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: '/api/auth',
  trustHost: true,
  secret: secretKey,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan Password wajib diisi.');
        }

        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error('User dengan email tersebut tidak ditemukan.');
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          throw new Error('Password yang dimasukkan salah.');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'CASHIER';
      }
      return token;
    },
    async session({ session, token }) {
      if (session && session.user && token) {
        session.user.id = (token.id as string) || (token.sub as string);
        (session.user as any).role = (token.role as string) || 'CASHIER';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
