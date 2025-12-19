"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AIChatAssistant } from "@/components/chat/ai-chat-assistant"
import { DecisionAnalyzer } from "@/components/decision/decision-analyzer"
import { LogOut, Menu, X } from "lucide-react"
// Import Firebase auth for a clean logout
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"

interface DashboardProps {
  user: { id: string; email: string }
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState<"chat" | "analyzer">("chat")

  // Handle Firebase Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth)
      onLogout() // Clear local state in page.tsx
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">DA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">DecideAI</h1>
              <p className="text-xs text-slate-400">Decision Assistant</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === "chat" ? "text-blue-400 bg-blue-500/10" : "text-slate-400 hover:text-white"
              }`}
            >
              AI Chat
            </button>
            <button
              onClick={() => setActiveTab("analyzer")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === "analyzer" ? "text-blue-400 bg-blue-500/10" : "text-slate-400 hover:text-white"
              }`}
            >
              Decision Analyzer
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
              <span className="text-slate-300 text-sm">{user.email}</span>
              <Button onClick={handleSignOut} variant="ghost" className="text-slate-400 hover:text-red-400">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => {
                  setActiveTab("chat")
                  setShowMobileMenu(false)
                }}
                className="w-full text-left px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
              >
                AI Chat
              </button>
              <button
                onClick={() => {
                  setActiveTab("analyzer")
                  setShowMobileMenu(false)
                }}
                className="w-full text-left px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
              >
                Decision Analyzer
              </button>
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <span className="text-slate-400 text-sm">{user.email}</span>
                <Button onClick={handleSignOut} variant="ghost" className="text-slate-400 hover:text-red-400">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content - Passing user ID to children */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "chat" && <AIChatAssistant userId={user.id} />}
        {activeTab === "analyzer" && <DecisionAnalyzer userId={user.id} />}
      </main>
    </div>
  )
}