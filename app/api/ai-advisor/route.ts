import { NextResponse } from 'next/server';

// Simplified handler that fetches data from render endpoint and returns it directly
export async function POST(request) {
  try {
    // Parse the incoming request JSON
    const body = await request.json();
    const { endpoint, text } = body;

    // Build the URL for your FastAPI endpoint
    const apiUrl = `https://ai-api-3.onrender.com/${endpoint}`;

    // Forward the request to FastAPI using fetch
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    // Simply get the data and return it directly without any formatting
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: `Failed to process request: ${error.message}` },
      { status: 500 }
    );
  }
}