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

async function getColors() {
  const imageUrl = "https://plus.unsplash.com/premium_photo-1742353866584-27c87d42da99?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/extract-colors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to extract colors');
    }

    const data = await response.json();
    return data.colors;
  } catch (error) {
    console.error('Error extracting colors:', error);
    return [];
  }
}

export default async function Home() {
  const colors = await getColors();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Color Extractor</h1>
      
      <div className="mb-8">
        <img
          src="https://plus.unsplash.com/premium_photo-1742353866584-27c87d42da99?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Source image"
          className="max-w-md rounded shadow"
        />
      </div>

      {colors.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Extracted Colors</h2>
          <div className="flex flex-wrap gap-4">
            {colors.map((color: FinalColor & { shade: 'dark' | 'light' }, index: number) => (
              <div
                key={index}
                className="flex flex-col items-center"
              >
                <div className="relative w-20 h-20 rounded shadow-md">
                  <div
                    className="absolute inset-0 rounded"
                    style={{ backgroundColor: `rgb(${color.red}, ${color.green}, ${color.blue})` }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                    <span className={`text-xs font-medium ${color.shade === 'dark' ? 'text-white' : 'text-black'}`}>
                      {color.shade.charAt(0).toUpperCase() + color.shade.slice(1)}
                    </span>
                    <span className={`text-[10px] ${color.shade === 'dark' ? 'text-white/90' : 'text-black/90'}`}>
                      {(color.area * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <span className="mt-2 text-sm">
                  RGB({color.red}, {color.green}, {color.blue})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
