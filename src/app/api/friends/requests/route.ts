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
        sender:users!friend_requests_sender_id_fkey(id, username, avatar_url)
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
    console.log('=== FRIEND REQUEST POST START ===');
    
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

    const body = await request.json();
    console.log('Request body:', body);
    
    const { friend_code } = body;
    
    console.log('Friend request attempt:', { 
      sender_id: session.user.id, 
      friend_code,
      timestamp: new Date().toISOString() 
    });

    if (!friend_code) {
      return NextResponse.json({ error: 'Friend code is required' }, { status: 400 });
    }

    // Găsește user-ul după friend code
    console.log('Searching for user with friend_code:', friend_code);
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, username, friend_code')
      .eq('friend_code', friend_code)
      .single();
    
    console.log('User search result:', { targetUser, userError });

    if (userError) {
      console.error('Error finding user by friend code:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Target user found:', { 
      id: targetUser.id, 
      username: targetUser.username,
      friend_code: targetUser.friend_code 
    });

    if (targetUser.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot add yourself as friend' }, { status: 400 });
    }

    // Verifică dacă există deja o prietenie
    console.log('Checking for existing friendship between users:', session.user.id, targetUser.id);
    const { data: existingFriendship, error: friendshipError } = await supabase
      .from('friendships')
      .select('*')
      .or(`user1_id.eq.${session.user?.id},user2_id.eq.${session.user?.id}`)
      .or(`user1_id.eq.${targetUser.id},user2_id.eq.${targetUser.id}`);
    
    console.log('Friendship check result:', { existingFriendship, friendshipError });

    if (friendshipError) {
      console.error('Error checking existing friendship:', friendshipError);
    }

    if (existingFriendship && existingFriendship.length > 0) {
      // Verifică dacă există o prietenie între cei doi useri
      const isFriends = existingFriendship.some(friendship => 
        (friendship.user1_id === session.user?.id && friendship.user2_id === targetUser.id) ||
        (friendship.user1_id === targetUser.id && friendship.user2_id === session.user?.id)
      );
      
      if (isFriends) {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 });
      }
    }

    // Verifică dacă există deja o cerere
    console.log('Checking for existing friend request between users:', session.user.id, targetUser.id);
    const { data: existingRequest, error: requestCheckError } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`sender_id.eq.${session.user?.id},receiver_id.eq.${session.user?.id}`)
      .or(`sender_id.eq.${targetUser.id},receiver_id.eq.${targetUser.id}`);
    
    console.log('Request check result:', { existingRequest, requestCheckError });

    if (requestCheckError) {
      console.error('Error checking existing requests:', requestCheckError);
    }

    if (existingRequest && existingRequest.length > 0) {
      // Verifică dacă există o cerere între cei doi useri
      const hasRequest = existingRequest.some(req => 
        (req.sender_id === session.user?.id && req.receiver_id === targetUser.id) ||
        (req.sender_id === targetUser.id && req.receiver_id === session.user?.id)
      );
      
      if (hasRequest) {
        return NextResponse.json({ error: 'Friend request already exists' }, { status: 400 });
      }
    }

    console.log('Creating friend request:', {
      sender_id: session.user.id,
      receiver_id: targetUser.id,
      status: 'pending'
    });

    // Creează cererea de prietenie
    console.log('Creating friend request with data:', {
      sender_id: session.user.id,
      receiver_id: targetUser.id,
      status: 'pending'
    });
    
    const { data: newRequest, error: requestError } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: session.user.id,
        receiver_id: targetUser.id,
        status: 'pending'
      })
      .select()
      .single();
    
    console.log('Friend request creation result:', { newRequest, requestError });

    if (requestError) {
      console.error('Error creating friend request:', requestError);
      throw requestError;
    }

    console.log('Friend request created successfully:', newRequest);

    return NextResponse.json({ 
      message: 'Friend request sent successfully',
      target_user: { 
        id: targetUser.id, 
        username: targetUser.username
      }
    });
  } catch (error) {
    console.error('=== FRIEND REQUEST ERROR ===');
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
