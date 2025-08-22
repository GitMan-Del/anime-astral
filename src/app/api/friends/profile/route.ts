import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { supabase } from '../../../../lib/supabase';

// GET - Obține profilul și friend code-ul user-ului curent
export async function GET() {
  try {
    console.log('=== PROFILE GET START ===');
    
    const session = await auth();
    console.log('Session auth result:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      userId: session?.user?.id 
    });
    
    if (!session?.user?.id) {
      console.log('Unauthorized - no session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obține informațiile user-ului curent
    console.log('Fetching user profile for ID:', session.user.id);
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, friend_code, avatar_url')
      .eq('id', session.user.id)
      .single();
    
    console.log('User profile query result:', { user, error });

    if (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('=== PROFILE ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'No message');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
