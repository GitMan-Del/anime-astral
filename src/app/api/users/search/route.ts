import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { isValidFriendCode } from '../../../../lib/friendCode';

// GET - Caută un utilizator după friend code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const friendCode = searchParams.get('code');

    if (!friendCode) {
      return NextResponse.json({ error: 'Friend code is required' }, { status: 400 });
    }

    if (!isValidFriendCode(friendCode)) {
      return NextResponse.json({ error: 'Invalid friend code format' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, display_name, avatar_url, friend_code, created_at')
      .eq('friend_code', friendCode)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
