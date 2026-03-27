import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request) {
  const url = request.nextUrl.pathname;

  // Manual bypass for PWA files
  if (
    url === "/sw.js" ||
    url === "/manifest.webmanifest" ||
    url.startsWith("/icons")
  ) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)",
  ],
};
