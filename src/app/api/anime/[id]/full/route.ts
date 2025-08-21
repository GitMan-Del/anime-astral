import { NextResponse } from "next/server";

type Params = {
  id: string;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<Params> }
) {
  // ✅ await params – obligatoriu în App Router
  const { id } = await params;
  const cleanId = id.trim();

  // ✅ Validare simplă pentru id numeric
  if (!cleanId || !/^[0-9]+$/.test(cleanId)) {
    return NextResponse.json(
      { error: "Parametru 'id' invalid. Trebuie să fie un număr." },
      { status: 400 }
    );
  }

  try {
    // ✅ Fetch cu revalidare (cache Next.js)
    const res = await fetch(
      `https://api.jikan.moe/v4/anime/${cleanId}/full`,
      {
        // cache ISR: revalidează la fiecare oră
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Jikan ${res.status}` },
        { status: res.status }
      );
    }

    const json = await res.json();
    return NextResponse.json(json, {
      status: 200,
    });
  } catch (err) {
    console.error("Eroare API Jikan:", err);
    return NextResponse.json(
      { error: "Eroare rețea sau server." },
      { status: 500 }
    );
  }
}
