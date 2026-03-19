import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

type SessionUser = {
  userId: string;
  status: string;
  email?: string | null;
  name?: string | null;
};

export async function requireAdmin(): Promise<SessionUser> {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user?.userId || user.status !== "ADMIN") {
    throw new Error("אין הרשאה. פעולה זו דורשת מנהל מערכת.");
  }
  return user;
}

export async function requireMember(): Promise<SessionUser> {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user?.userId || (user.status !== "MEMBER" && user.status !== "ADMIN")) {
    throw new Error("אין הרשאה. פעולה זו דורשת חבר רשום.");
  }
  return user;
}
