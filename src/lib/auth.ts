import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compareSync } from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

function getDbUrl() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) throw new Error('DATABASE_URL is not set');
  return dbUrl.replace(/[?&]channel_binding=[^&]*/g, '').replace(/\?&/, '?');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const sql = neon(getDbUrl());
        const users = await sql`SELECT * FROM admin_users WHERE username = ${credentials.username as string}`;
        const user = users[0];

        if (!user) return null;

        const valid = compareSync(credentials.password as string, user.password_hash);
        if (!valid) return null;

        return { id: String(user.id), name: user.username };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  trustHost: true,
});
