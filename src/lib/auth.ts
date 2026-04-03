import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compareSync } from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

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

        const sql = neon(process.env.DATABASE_URL!);
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
});
