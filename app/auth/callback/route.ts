import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    try {
        const { searchParams, origin } = new URL(request.url);
        const code = searchParams.get('code');
        const next = searchParams.get('next') || '/projects';

        if (code) {
            const supabase = await createClient()
            const { error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
                console.error('Auth error', error)
                throw error;
            }
        }

        return NextResponse.redirect(new URL(next, origin));
    } catch (error) {
        console.error("Callback error :",error);
        const errorUrl = new URL('auth/auth-error', request.url);
        errorUrl.searchParams.set('error', 'Failed to sign in');
        return NextResponse.redirect(errorUrl);  
    }



}