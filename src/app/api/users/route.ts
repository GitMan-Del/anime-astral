import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { generateFriendCode } from '../../../lib/friendCode';

// GET - Obține toți utilizatorii (pentru testare)
export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, username, display_name, avatar_url, friend_code, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Generează un friend code nou pentru un utilizator
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Generează un friend code unic
    let friendCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!isUnique && attempts < maxAttempts) {
      friendCode = generateFriendCode();
      const { data: existingCode } = await supabase
        .from('users')
        .select('id')
        .eq('friend_code', friendCode)
        .single();
      
      if (!existingCode) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ error: 'Could not generate unique friend code' }, { status: 500 });
    }

    // Actualizează utilizatorul cu noul friend code
    const { error: updateError } = await supabase
      .from('users')
      .update({ friend_code: friendCode })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      friend_code: friendCode,
      message: 'Friend code generated successfully'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
