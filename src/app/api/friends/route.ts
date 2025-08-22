import { NextResponse } from 'next/server';
import { auth } from '../../auth';
import { supabase } from '../../../lib/supabase';

// GET - Obține lista de prieteni
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obține prietenii direct din tabela friendships
    const { data: friendships, error } = await supabase
      .from('friendships')
      .select(`
        *,
        user1:users!friendships_user1_id_fkey(id, username, display_name, avatar_url),
        user2:users!friendships_user2_id_fkey(id, username, display_name, avatar_url)
      `)
      .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`);

    if (error) throw error;

    // Transformă datele pentru a afișa prietenul (nu user-ul curent)
    const friends = friendships?.map(friendship => {
      const currentUserId = session?.user?.id;
      const friend = friendship.user1_id === currentUserId
        ? friendship.user2
        : friendship.user1;
      return {
        id: friend.id,
        username: friend.username,
        display_name: friend.display_name,
        avatar_url: friend.avatar_url,
        friendship_id: friendship.id,
        friends_since: friendship.created_at
      };
    }) || [];

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
