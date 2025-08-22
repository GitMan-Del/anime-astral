import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { supabase } from '../../../../../lib/supabase';

// PUT - Acceptă sau respinge o cerere de prietenie
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json(); // 'accept' sau 'reject'
    const { id: requestId } = await params;

    // RLS va verifica că user-ul curent este receiver-ul
    const { data: friendRequest, error: fetchError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('id', requestId)
      .eq('receiver_id', session.user.id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    if (action === 'accept') {
      // Creează prietenia
      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert({
          user1_id: friendRequest.sender_id,
          user2_id: friendRequest.receiver_id
        });

      if (friendshipError) throw friendshipError;
    }

    // Actualizează statusul cererii
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ 
        status: action === 'accept' ? 'accepted' : 'rejected'
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      message: `Friend request ${action}ed successfully` 
    });
  } catch (error) {
    console.error('Error handling friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Șterge o cerere de prietenie
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: requestId } = await params;

    // RLS va permite ștergerea doar dacă user-ul este sender sau receiver
    const { error } = await supabase
      .from('friend_requests')
      .delete()
      .eq('id', requestId);

    if (error) throw error;

    return NextResponse.json({ message: 'Friend request deleted successfully' });
  } catch (error) {
    console.error('Error deleting friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
