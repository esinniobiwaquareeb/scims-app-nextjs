import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-static';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'og-home.png');
    const imageBuffer = await readFile(filePath);
    
    return new NextResponse(imageBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': imageBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving OG image:', error);
    return new NextResponse('Image not found', { status: 404 });
  }
}

