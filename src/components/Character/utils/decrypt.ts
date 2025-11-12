async function generateAESKey(password: string): Promise<CryptoKey> {
  // Check if crypto.subtle is available (requires HTTPS or localhost)
  if (!crypto || !crypto.subtle) {
    throw new Error("Web Crypto API is not available. This feature requires HTTPS or localhost. window.isSecureContext: " + window.isSecureContext);
  }
  
  const passwordBuffer = new TextEncoder().encode(password);
  const hashedPassword = await crypto.subtle.digest("SHA-256", passwordBuffer);
  return crypto.subtle.importKey(
    "raw",
    hashedPassword.slice(0, 32),
    { name: "AES-CBC" },
    false,
    ["encrypt", "decrypt"]
  );
}

export const decryptFile = async (
  url: string,
  password: string
): Promise<ArrayBuffer> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    const encryptedData = await response.arrayBuffer();
    const iv = new Uint8Array(encryptedData.slice(0, 16));
    const data = encryptedData.slice(16);
    const key = await generateAESKey(password);
    return crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, data);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw error;
  }
};