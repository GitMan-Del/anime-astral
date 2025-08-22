import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { supabase } from '../../../../lib/supabase';

// GET - Test endpoint pentru a verifica structura bazei de date
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: {
      user: unknown;
      tables: Record<string, string>;
      errors: string[];
    } = {
      user: null,
      tables: {},
      errors: []
    };

    // Verifică user-ul curent
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, username, friend_code')
        .eq('id', session.user.id)
        .single();

      if (error) {
        results.errors.push(`User query error: ${error.message}`);
      } else {
        results.user = user;
      }
    } catch (error) {
      results.errors.push(`User query exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Verifică dacă tabela friend_requests există
    try {
      const { error } = await supabase
        .from('friend_requests')
        .select('count')
        .limit(1);

      if (error) {
        results.errors.push(`friend_requests table error: ${error.message}`);
      } else {
        results.tables.friend_requests = 'exists';
      }
    } catch (error) {
      results.errors.push(`friend_requests table exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Verifică dacă tabela friendships există
    try {
      const { error } = await supabase
        .from('friendships')
        .select('count')
        .limit(1);

      if (error) {
        results.errors.push(`friendships table error: ${error.message}`);
      } else {
        results.tables.friendships = 'exists';
      }
    } catch (error) {
      results.errors.push(`friendships table exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Verifică dacă user-ul are friend_code
    if (results.user && typeof results.user === 'object' && results.user !== null && 'friend_code' in results.user && !results.user.friend_code) {
      results.errors.push('User missing friend_code');
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
