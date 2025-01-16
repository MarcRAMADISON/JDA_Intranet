import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';


export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth-token');
  
  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/Fiches','/statistique'], 
};
