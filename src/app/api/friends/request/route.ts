import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// POST - Trimite o cerere de prietenie
export async function POST(request: NextRequest) {
  try {
    const { senderId, receiverId } = await request.json();

    if (!senderId || !receiverId) {
      return NextResponse.json({ error: 'Sender ID and Receiver ID are required' }, { status: 400 });
    }

    if (senderId === receiverId) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    // Verifică dacă există deja o cerere de prietenie
    const { data: existingRequests, error: existingRequestError } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`sender_id.eq.${senderId},receiver_id.eq.${senderId}`)
      .or(`sender_id.eq.${receiverId},receiver_id.eq.${receiverId}`);

    if (existingRequestError) {
      console.error('Error checking existing requests:', existingRequestError);
    }

    // Verifică dacă există deja o cerere între acești utilizatori
    const hasExistingRequest = existingRequests?.some(request => 
      (request.sender_id === senderId && request.receiver_id === receiverId) ||
      (request.sender_id === receiverId && request.receiver_id === senderId)
    );

    if (hasExistingRequest) {
      return NextResponse.json({ error: 'Friend request already exists' }, { status: 400 });
    }

    // Verifică dacă sunt deja prieteni
    const { data: existingFriendships, error: existingFriendshipError } = await supabase
      .from('friendships')
      .select('*')
      .or(`user1_id.eq.${senderId},user2_id.eq.${senderId}`)
      .or(`user1_id.eq.${receiverId},user2_id.eq.${receiverId}`);

    if (existingFriendshipError) {
      console.error('Error checking existing friendships:', existingFriendshipError);
    }

    // Verifică dacă există deja o prietenie între acești utilizatori
    const hasExistingFriendship = existingFriendships?.some(friendship => 
      (friendship.user1_id === senderId && friendship.user2_id === receiverId) ||
      (friendship.user1_id === receiverId && friendship.user2_id === senderId)
    );

    if (hasExistingFriendship) {
      return NextResponse.json({ error: 'Users are already friends' }, { status: 400 });
    }

    // Creează cererea de prietenie
    const { data: friendRequest, error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating friend request:', error);
      return NextResponse.json({ error: 'Failed to create friend request' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      friend_request: friendRequest,
      message: 'Friend request sent successfully'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
