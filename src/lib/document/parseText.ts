export async function parseText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else if (result instanceof ArrayBuffer) {
        const decoder = new TextDecoder('utf-8');
        resolve(decoder.decode(result));
      } else {
        reject(new Error(`Failed to read file: ${file.name}`));
      }
    };
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsText(file);
  });
}