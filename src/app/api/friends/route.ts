import { NextResponse } from 'next/server';
import { auth } from '../../auth';
import { supabase } from '../../../lib/supabase';

// GET - Obține lista de prieteni
export async function GET() {
  try {
    console.log('=== FRIENDS LIST GET START ===');
    
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

    // Obține prietenii direct din tabela friendships
    console.log('Fetching friendships for user ID:', session.user.id);
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select(`
        *,
        user1:users!friendships_user1_id_fkey(id, username, avatar_url),
        user2:users!friendships_user2_id_fkey(id, username, avatar_url)
      `)
      .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`);
    
    console.log('Friendships query result:', { friendships, error });

    if (error) throw error;

    // Transformă datele pentru a afișa prietenul (nu user-ul curent)
    console.log('Transforming friendships data...');
    const friends = friendships?.map(friendship => {
      const currentUserId = session?.user?.id;
      const friend = friendship.user1_id === currentUserId
        ? friendship.user2
        : friendship.user1;
      return {
        id: friend.id,
        username: friend.username,
        avatar_url: friend.avatar_url,
        friendship_id: friendship.id,
        friends_since: friendship.created_at
      };
    }) || [];
    
    console.log('Transformed friends data:', friends);

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('=== FRIENDS LIST ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'No message');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
