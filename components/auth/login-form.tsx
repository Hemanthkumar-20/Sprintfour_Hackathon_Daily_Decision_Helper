"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, Lock, ArrowRight, Zap, Loader2 } from "lucide-react"

// Firebase imports
import { auth, db } from "@/lib/firebase"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

interface LoginFormProps {
  onLoginSuccess: (user: { id: string; email: string }) => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // 1. Manual Validations
      if (!email || !password) {
        throw new Error("Please fill in all fields")
      }

      if (isLogin) {
        // --- LOGIN FLOW ---
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password)
          onLoginSuccess({ id: userCredential.user.uid, email: userCredential.user.email! })
        } catch (firebaseErr: any) {
          // Handle login-specific errors
          if (firebaseErr.code === "auth/user-not-found" || firebaseErr.code === "auth/invalid-credential") {
            setError("Account not found or invalid credentials. If you're new, please Register.")
          } else if (firebaseErr.code === "auth/wrong-password") {
            setError("Incorrect password. Please try again.")
          } else {
            throw firebaseErr // Pass to main catch for generic handling
          }
        }
      } else {
        // --- REGISTRATION FLOW ---
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match")
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters")
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Save user profile to Firestore
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          createdAt: new Date().toISOString(),
        })

        onLoginSuccess({ id: user.uid, email: user.email! })
      }
    } catch (err: any) {
      // 2. Global Error Handling (Fixes the 'undefined' issue)
      console.error("Auth Error Detail:", err)
      
      if (err.code) {
        // Handle Firebase codes
        switch (err.code) {
          case "auth/email-already-in-use":
            setError("This email is already registered. Please sign in instead.")
            setIsLogin(true)
            break;
          case "auth/invalid-email":
            setError("The email address is not valid.")
            break;
          case "auth/operation-not-allowed":
            setError("Email/Password accounts are not enabled in Firebase Console.")
            break;
          case "auth/weak-password":
            setError("The password is too weak.")
            break;
          default:
            setError(err.message || "An authentication error occurred.")
        }
      } else {
        // Handle manual errors (like "Passwords do not match")
        setError(err.message || "An unexpected error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">SprintAI</h1>
          </div>
          <p className="text-slate-400">Make smarter decisions with AI guidance</p>
        </div>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <div className="p-8">
            {/* Tab Toggle */}
            <div className="flex gap-4 mb-8">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(""); }}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  isLogin ? "bg-blue-600 text-white" : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(""); }}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  !isLogin ? "bg-blue-600 text-white" : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 mt-6"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}