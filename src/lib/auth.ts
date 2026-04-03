import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compareSync } from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

function cleanDbUrl(url: string): string {
  const u = new URL(url);
  u.searchParams.delete('channel_binding');
  return u.toString();
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

        const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
        if (!dbUrl) return null;
        const sql = neon(cleanDbUrl(dbUrl));
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
