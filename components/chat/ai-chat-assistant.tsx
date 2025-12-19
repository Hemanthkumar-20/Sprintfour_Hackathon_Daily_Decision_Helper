"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Send, Loader2, Zap } from "lucide-react"

// Firebase imports
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: any
}

interface AIChatAssistantProps {
  userId: string
}

export function AIChatAssistant({ userId }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // 🔹 REALTIME LISTENER
  useEffect(() => {
    if (!userId) return

    const q = query(
      collection(db, "chats"),
      where("userId", "==", userId),
      orderBy("createdAt", "asc")
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().createdAt?.toDate() || new Date(),
        })) as Message[]

        setMessages(fetchedMessages)
        scrollToBottom()
      },
      (error) => {
        console.error("Firestore Listener Error:", error.message)
      }
    )

    return () => unsubscribe()
  }, [userId])

  // 🔹 SEND MESSAGE + AI RESPONSE
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    setLoading(true)
    const userContent = input
    setInput("")

    try {
      // 1️⃣ Save user message
      await addDoc(collection(db, "chats"), {
        userId,
        role: "user",
        content: userContent,
        createdAt: serverTimestamp(),
      })

      // 2️⃣ Call AI API (server-side)
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a helpful decision-making AI assistant." },
            { role: "user", content: userContent },
          ],
        }),
      })

      const data = await res.json()

      const aiReply =
        data?.reply && data.reply.trim().length > 0
          ? data.reply
          : "AI did not return a response."

      await addDoc(collection(db, "chats"), {
        userId,
        role: "assistant",
        content: aiReply,
        createdAt: serverTimestamp(),
      })

    } catch (error: any) {
      console.error("Chat Error:", error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-slate-900/50 border-slate-700/50 flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !loading && (
            <p className="text-slate-500 text-center mt-10 italic">
              Start a conversation to get decision insights.
            </p>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600/80 text-white rounded-br-none"
                    : "bg-slate-800/80 text-slate-100 rounded-bl-none"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-[10px] opacity-50 block mt-1">
                  {message.timestamp instanceof Date
                    ? message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Sending..."}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/80 px-4 py-3 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="border-t border-slate-700/50 p-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white"
              disabled={loading}
            />
            <Button disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>

      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <h3 className="text-white flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-blue-400" />
          Quick Tips
        </h3>
        <ul className="text-slate-300 text-sm space-y-2">
          <li>• Be specific</li>
          <li>• Compare options</li>
          <li>• Ask follow-ups</li>
        </ul>
      </Card>
    </div>
  )
}
