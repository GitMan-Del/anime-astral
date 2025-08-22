import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { supabase } from '../../../../lib/supabase';

// GET - Obține cererile de prietenie
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RLS va permite doar cererile primite de user-ul curent
    const { data: requests, error } = await supabase
      .from('friend_requests')
      .select(`
        *,
        sender:users!friend_requests_sender_id_fkey(id, username, display_name, avatar_url)
      `)
      .eq('receiver_id', session.user.id)
      .eq('status', 'pending');

    if (error) throw error;

    return NextResponse.json({ requests: requests || [] });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Trimite o cerere de prietenie
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { friend_code } = await request.json();

    // Găsește user-ul după friend code
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, username, display_name')
      .eq('friend_code', friend_code)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot add yourself as friend' }, { status: 400 });
    }

    // Verifică dacă există deja o prietenie
    const { data: existingFriendship } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(user1_id.eq.${session.user.id},user2_id.eq.${targetUser.id}),and(user1_id.eq.${targetUser.id},user2_id.eq.${session.user.id})`)
      .single();

    if (existingFriendship) {
      return NextResponse.json({ error: 'Already friends' }, { status: 400 });
    }

    // Verifică dacă există deja o cerere
    const { data: existingRequest } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${targetUser.id}),and(sender_id.eq.${targetUser.id},receiver_id.eq.${session.user.id})`)
      .single();

    if (existingRequest) {
      return NextResponse.json({ error: 'Friend request already exists' }, { status: 400 });
    }

    // Creează cererea de prietenie (RLS va verifica că sender_id = auth.uid())
    const { error: requestError } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: session.user.id,
        receiver_id: targetUser.id,
        status: 'pending'
      });

    if (requestError) throw requestError;

    return NextResponse.json({ 
      message: 'Friend request sent successfully',
      target_user: { 
        id: targetUser.id, 
        username: targetUser.username,
        display_name: targetUser.display_name
      }
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
