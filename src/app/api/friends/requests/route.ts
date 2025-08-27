import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// GET - Obține cererile de prietenie pentru un utilizator
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Obține cererile primite (pending)
    const { data: receivedRequests, error: receivedError } = await supabase
      .from('friend_requests')
      .select(`
        *,
        sender:users!friend_requests_sender_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          friend_code
        )
      `)
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (receivedError) {
      console.error('Error fetching received requests:', receivedError);
      return NextResponse.json({ error: 'Failed to fetch received requests' }, { status: 500 });
    }

    // Obține cererile trimise (pending)
    const { data: sentRequests, error: sentError } = await supabase
      .from('friend_requests')
      .select(`
        *,
        receiver:users!friend_requests_receiver_id_fkey(
          id,
          username,
          display_name,
          avatar_url,
          friend_code
        )
      `)
      .eq('sender_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (sentError) {
      console.error('Error fetching sent requests:', sentError);
      return NextResponse.json({ error: 'Failed to fetch sent requests' }, { status: 500 });
    }

    return NextResponse.json({ 
      received: receivedRequests || [],
      sent: sentRequests || []
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Actualizează statusul unei cereri de prietenie
export async function PUT(request: NextRequest) {
  try {
    const { requestId, status, userId } = await request.json();

    if (!requestId || !status || !userId) {
      return NextResponse.json({ error: 'Request ID, status and user ID are required' }, { status: 400 });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be accepted or rejected' }, { status: 400 });
    }

    // Obține cererea de prietenie
    const { data: friendRequest, error: fetchError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('id', requestId)
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !friendRequest) {
      return NextResponse.json({ error: 'Friend request not found or already processed' }, { status: 404 });
    }

    // Actualizează statusul cererii
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating friend request:', updateError);
      return NextResponse.json({ error: 'Failed to update friend request' }, { status: 500 });
    }

    // Dacă cererea este acceptată, creează prietenia
    if (status === 'accepted') {
      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert({
          user1_id: friendRequest.sender_id,
          user2_id: friendRequest.receiver_id
        });

      if (friendshipError) {
        console.error('Error creating friendship:', friendshipError);
        // Nu returnăm eroare aici, deoarece cererea a fost actualizată cu succes
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Friend request ${status} successfully`
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
