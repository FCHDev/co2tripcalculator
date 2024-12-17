import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const apiKey = process.env.OPENCAGE_API_KEY;
    if (!apiKey) {
      throw new Error('La clé API OpenCage n\'est pas configurée');
    }

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&language=fr&limit=5`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erreur lors de la requête à l\'API OpenCage');
    }

    const data = await response.json();
    
    const suggestions = data.results.map((result: any) => ({
      name: result.formatted,
      components: result.components
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Une erreur est survenue" },
      { status: 500 }
    );
  }
} 