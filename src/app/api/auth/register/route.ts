import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '../../../../lib/supabase';

// Verifică variabilele de mediu
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not configurate');
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Baza de date nu este configurată. Contactează administratorul.' },
        { status: 500 }
      );
    }

    const contentType = request.headers.get('content-type');
    const rawBody = await request.text();

    if (!rawBody) {
      return NextResponse.json(
        { error: 'Corpul cererii este gol' },
        { status: 400 }
      );
    }

    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type trebuie să fie application/json' },
        { status: 400 }
      );
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'Format JSON invalid' },
        { status: 400 }
      );
    }

    const { email, password, confirmPassword } = body;

    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Toate câmpurile sunt obligatorii' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresa de email nu este validă' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Parola trebuie să aibă cel puțin 8 caractere' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Parolele nu se potrivesc' },
        { status: 400 }
      );
    }

    // Verifică dacă utilizatorul există deja
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: `Eroare la verificarea utilizatorului: ${checkError.message}` },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilizator cu această adresă de email există deja' },
        { status: 409 }
      );
    }

    // Hash parola
    const passwordHash = await bcrypt.hash(password, 12);

    // Creare utilizator în Supabase
    const userData = {
      email,
      password_hash: passwordHash,
      auth_provider: 'credentials' as const,
      email_verified: false,
    };

    const { data: newUser, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Eroare la crearea contului: ${error.message}` },
        { status: 500 }
      );
    }

    if (!newUser) {
      return NextResponse.json(
        { error: 'Eroare la crearea contului: nu s-au returnat date' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Cont creat cu succes!',
        user: {
          id: newUser.id,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Eroare internă a serverului. Te rugăm să încerci din nou.' },
      { status: 500 }
    );
  }
}
