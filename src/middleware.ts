import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MEMBER_ROUTES = ["/directory", "/gmach", "/life-events"];

function isMemberRoute(path: string) {
  return MEMBER_ROUTES.some((r) => path === r || path.startsWith(r + "/"));
}

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const path = request.nextUrl.pathname;

  const isAuthPage = path.startsWith("/auth");
  const isPendingPage = path === "/pending";
  const isApiAuth = path.startsWith("/api/auth");

  if (isApiAuth) return NextResponse.next();

  const status = token?.status as string | undefined;
  const isMember = status === "MEMBER" || status === "ADMIN";

  if (token && status === "PENDING" && !isPendingPage && !isAuthPage) {
    return NextResponse.redirect(new URL("/pending", request.url));
  }

  if (isMemberRoute(path) && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (isMemberRoute(path) && token && !isMember) {
    return NextResponse.redirect(new URL("/pending", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.jpg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
