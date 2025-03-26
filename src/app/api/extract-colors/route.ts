import { NextRequest, NextResponse } from 'next/server';
import { extractColorsFromImageData } from 'extract-colors';
import type { FinalColor } from 'extract-colors/lib/types/Color';
import type { NodeOptions } from 'extract-colors/lib/types/Options';
import getPixels from 'get-pixels';
import { promisify } from 'util';

// Convert getPixels to a Promise-based function
const getPixelsAsync = promisify(getPixels);

// Helper function to determine if a color is dark or light
const getShade = (lightness: number): 'dark' | 'light' => {
  return lightness < 0.5 ? 'dark' : 'light';
};

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Fetch the image
    const response = await fetch(imageUrl);
    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get pixels data using get-pixels
    const pixels = await getPixelsAsync(buffer, contentType);
    const data = new Uint8ClampedArray(pixels.data);
    const [width, height] = pixels.shape;

    // Extract colors using the new approach with adjusted parameters
    const options: NodeOptions = {
      // distance: 0.1, // Reduced distance to better distinguish similar colors
      // saturationDistance: 0.15, // Adjusted saturation distance
      // lightnessDistance: 0.15, // Adjusted lightness distance
      // hueDistance: 0.1, // Reduced hue distance to better capture green hues
      // pixels: 100000 // Increased pixel sample size
    };

    const colors = extractColorsFromImageData({ data, width, height }, options);
    const sortedColors = colors
      .sort((a: FinalColor, b: FinalColor) => b.area - a.area)
      .map(color => ({
        ...color,
        shade: getShade(color.lightness)
      }));

    return NextResponse.json({ colors: sortedColors });
  } catch (error) {
    console.error('Error extracting colors:', error);
    return NextResponse.json(
      { error: 'Failed to extract colors from image' },
      { status: 500 }
    );
  }
} 