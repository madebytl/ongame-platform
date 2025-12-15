// Gemini API Service for AI Chat and Image Generation

const GEMINI_API_KEY =
  (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "";

interface ChatMessage {
  role: "user" | "model" | "system";
  text: string;
}

// Generate Pit Boss AI Response
export async function generatePitBossResponse(
  messages: ChatMessage[],
  userInput: string,
  balance: number
): Promise<string> {
  // Fallback responses if API key is not available
  if (!GEMINI_API_KEY) {
    const fallbackResponses = [
      `Hey! Your balance is ${balance.toLocaleString()} coins. Keep playing to win big! 🎰`,
      `Looking good with ${balance.toLocaleString()} coins! Want some tips?`,
      `I see you have ${balance.toLocaleString()} coins. That's a solid stack!`,
      `Balance: ${balance.toLocaleString()} coins. Ready to hit the jackpot?`,
    ];
    return fallbackResponses[
      Math.floor(Math.random() * fallbackResponses.length)
    ];
  }

  try {
    const systemPrompt = `You are a friendly casino Pit Boss for an online gaming platform. 
    The player's current balance is ${balance.toLocaleString()} coins. 
    Be encouraging, fun, and helpful. Keep responses short (1-2 sentences max). 
    Use emojis occasionally.`;

    const conversationHistory = messages
      .slice(-5) // Last 5 messages for context
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt }],
            },
            ...conversationHistory,
            {
              role: "user",
              parts: [{ text: userInput }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      `Thanks for playing! Your balance: ${balance.toLocaleString()} coins.`
    );
  } catch (error) {
    console.error("Gemini API error:", error);
    return `I'm having trouble connecting right now, but I see you have ${balance.toLocaleString()} coins! Keep playing! 🎰`;
  }
}

// Generate Casino-themed Image
export async function generateCasinoImage(
  prompt: string,
  size: "1K" | "2K" | "4K" = "1K"
): Promise<string | null> {
  // Fallback placeholder if API key is not available
  if (!GEMINI_API_KEY) {
    // Return a placeholder image URL
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/${
      size === "1K" ? "512" : size === "2K" ? "1024" : "2048"
    }`;
  }

  try {
    const sizeMap = {
      "1K": "512x512",
      "2K": "1024x1024",
      "4K": "2048x2048",
    };

    // Note: Gemini doesn't have image generation yet, so we'll use a placeholder
    // In production, you might want to use Imagen API or DALL-E
    const enhancedPrompt = `Casino gaming theme, ${prompt}, vibrant colors, neon lights, digital art style`;

    // For now, return a placeholder that matches the prompt
    // In a real implementation, you'd call an image generation API here
    return `https://picsum.photos/seed/${encodeURIComponent(enhancedPrompt)}/${
      size === "1K" ? "512" : size === "2K" ? "1024" : "2048"
    }`;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}

// Edit Casino Image
export async function editCasinoImage(
  imageDataUrl: string,
  editPrompt: string
): Promise<string | null> {
  // Fallback: return the original image if API key is not available
  if (!GEMINI_API_KEY) {
    return imageDataUrl;
  }

  try {
    // Note: This would require image editing API
    // For now, return the original image
    // In production, you'd use Gemini's image editing capabilities or another service
    console.log("Image edit requested:", editPrompt);
    return imageDataUrl;
  } catch (error) {
    console.error("Image editing error:", error);
    return imageDataUrl;
  }
}
