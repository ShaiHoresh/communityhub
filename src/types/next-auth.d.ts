import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    userId?: string;
    status?: string;
  }

  interface Session {
    user: {
      userId?: string;
      status?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    status?: string;
  }
}
