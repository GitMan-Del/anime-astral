import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// GET - Obține lista de prieteni pentru un utilizator
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Obține prieteniile unde utilizatorul este user1
    const { data: friendships1, error: error1 } = await supabase
      .from('friendships')
      .select(`
        *,
        friend:users!friendships_user2_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          friend_code,
          created_at
        )
      `)
      .eq('user1_id', userId);

    if (error1) {
      console.error('Error fetching friendships1:', error1);
      return NextResponse.json({ error: 'Failed to fetch friendships' }, { status: 500 });
    }

    // Obține prieteniile unde utilizatorul este user2
    const { data: friendships2, error: error2 } = await supabase
      .from('friendships')
      .select(`
        *,
        friend:users!friendships_user1_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          friend_code,
          created_at
        )
      `)
      .eq('user2_id', userId);

    if (error2) {
      console.error('Error fetching friendships2:', error2);
      return NextResponse.json({ error: 'Failed to fetch friendships' }, { status: 500 });
    }

    // Combină și formatează rezultatele
    const friends = [
      ...(friendships1 || []).map(f => ({
        friendship_id: f.id,
        friend: f.friend,
        friends_since: f.created_at
      })),
      ...(friendships2 || []).map(f => ({
        friendship_id: f.id,
        friend: f.friend,
        friends_since: f.created_at
      }))
    ].sort((a, b) => new Date(b.friends_since).getTime() - new Date(a.friends_since).getTime());

    return NextResponse.json({ 
      friends,
      count: friends.length
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
