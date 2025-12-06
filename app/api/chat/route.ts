import { timeStamp } from "console";
import { type NextRequest, NextResponse } from "next/server";
import Stream from "stream";
import { optional } from "zod";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

async function generateAiResponse(messages: ChatMessage[]): Promise<string> {
  const systemPrompt = `You are a helpful AI coding assistant. You help developers with:
                            -Code explanation and debugging
                            -Best practices and architecture advice
                            -Writing clean and efficient code
                            -Code reviews and optimizations
                            
                        Always provide clear, practical answers according to the frameworks used within the file. Use proper code formatting when showing examples.`;
  const fullMessages = [{ role: "system", content: systemPrompt }, ...messages];

  const prompt = fullMessages
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n\n");

  try {
    // Use AbortController to timeout if Ollama doesn't respond
    // Increase timeout to 12s to allow longer model responses but still fail fast.
    const controller = new AbortController();
    const timeoutMs = 15000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "codellama:latest",
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 100, //maximum response length
          top_p: 0.9, //controls diversity
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const txt = await response.text().catch(() => "");
      throw new Error(
        `AI service error: ${response.status} ${response.statusText} ${txt}`
      );
    }

    const data = await response.json();

    if (!data || !data.response) {
      throw new Error("No response from AI");
    }

    return String(data.response).trim();
  } catch (error) {
    // Normalize abort error
    if ((error as any)?.name === "AbortError") {
      throw new Error("Request timeout: AI model took too long to respond");
    }
    console.error("AI generation error:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    const validateHistory = Array.isArray(history)
      ? history.filter(
          (msg) =>
            msg &&
            typeof msg === "object" &&
            typeof msg.role === "string" &&
            typeof msg.content === "string" &&
            ["user", "assistant"].includes(msg.role)
        )
      : [];

    const recentHistory = validateHistory.slice(-10);

    const messages: ChatMessage[] = [
      ...recentHistory,
      { role: "user", content: message },
    ];

    // Generate AI response (await the async operation)
    try {
      const aiResponse = await generateAiResponse(messages);

      return NextResponse.json({
        response: aiResponse,
        timeStamp: new Date().toISOString(),
      });
    } catch (err) {
      // If the AI timed out, provide a friendly fallback response so the UI
      // receives a usable assistant message instead of a 500 HTML page.
      const message =
        err instanceof Error && err.message.includes("timeout")
          ? "The AI model is currently taking too long to respond. I couldn't reach the local AI service — here's a fallback message: please try again in a moment, or ensure the local model is running at http://localhost:11434."
          : `AI generation failed: ${
              err instanceof Error ? err.message : String(err)
            }`;

      console.warn("AI chat fallback response sent:", err);

      return NextResponse.json(
        {
          response: message,
          model: "fallback",
          tokens: 0,
          timeStamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in AI chat route:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
