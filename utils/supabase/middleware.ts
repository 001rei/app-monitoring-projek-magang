import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// paths tidak perlu auth
const publicPaths = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/auth/callback',
    '/auth/reset-password',
    '/auth/auth-error',
    '/profile/:id',
]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ambil current path 
  const currentPath = request.nextUrl.pathname;

  // menentukan path selanjutnya (redirect) berdasarkan current path
  const nextPath = 
    currentPath == '/login' || currentPath == '/register' 
      ? request.nextUrl.searchParams.get('next') || '/' 
      : currentPath;

  // cek apakah path yang diakses merupakan public path
  const isPublicPath = publicPaths.some( path => {
    const pattern = path.replace(':id', '[^/]+');
    const regex = new RegExp(`${pattern}$`);
    return regex.test(currentPath);
  });

  // redirect not-authenticated user yang coba akses path non-public ke halaman login
  if (!session && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', currentPath);
    return NextResponse.redirect(url);
  }

  if (session && 
      (currentPath == '/login' || currentPath == '/register'))
      {
        const url = new URL(nextPath, request.url);
        return NextResponse.redirect(url);
      };

  return supabaseResponse
}