"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Dashboard } from "@/components/dashboard/dashboard"
import { auth } from "@/lib/firebase" // Ensure this path is correct
import { onAuthStateChanged } from "firebase/auth"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for Firebase Auth changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
        })
      } else {
        // User is signed out
        setUser(null)
      }
      setLoading(false)
    })

    // Clean up listener on unmount
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {!user ? (
        <LoginForm onLoginSuccess={setUser} />
      ) : (
        <Dashboard user={user} onLogout={() => setUser(null)} />
      )}
    </main>
  )
}