import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware leve: a verificação de role real é feita nos layouts via client-side
// porque o Firebase Auth é client-only no App Router
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("pbl_session")?.value;

  // Rota de login: se já tem sessão, redireciona para o onboarding
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Rotas protegidas sem sessão: redireciona para login
  const protectedPaths = ["/onboarding", "/profile", "/phase", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
