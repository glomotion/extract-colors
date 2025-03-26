declare module 'get-pixels' {
  interface Pixels {
    data: Uint8Array;
    shape: [number, number, number];
  }

  type Callback = (err: Error | null, pixels: Pixels) => void;

  function getPixels(input: Buffer | string, format?: string, callback: Callback): void;

  export = getPixels;
} 