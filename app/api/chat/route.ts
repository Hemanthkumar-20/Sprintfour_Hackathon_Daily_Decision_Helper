export const runtime = "nodejs"

import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // ✅ FIXED MODEL
          messages,
          temperature: 0.7,
          max_tokens: 512,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error("Groq Error:", data)
      return NextResponse.json({
        reply: "AI service is temporarily unavailable.",
      })
    }

    return NextResponse.json({
      reply:
        data?.choices?.[0]?.message?.content ||
        "AI did not generate a response.",
    })
  } catch (error) {
    console.error("Groq Fatal Error:", error)
    return NextResponse.json({
      reply: "AI service is temporarily unavailable.",
    })
  }
}
