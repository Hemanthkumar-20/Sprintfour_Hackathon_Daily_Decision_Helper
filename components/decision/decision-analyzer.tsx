"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart, PlusCircle, Trash2, Save, Loader2 } from "lucide-react"

// Firebase imports
import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"

interface Option {
  id: string
  name: string
  scores: { [key: string]: number }
}

interface DecisionAnalyzerProps {
  userId: string
}

const factors = ["Time", "Cost", "Effort", "Impact", "Risk"]

export function DecisionAnalyzer({ userId }: DecisionAnalyzerProps) {
  const [title, setTitle] = useState("New Decision Analysis")
  const [options, setOptions] = useState<Option[]>([
    {
      id: "1",
      name: "Option 1",
      scores: { Time: 3, Cost: 3, Effort: 3, Impact: 3, Risk: 3 },
    },
    {
      id: "2",
      name: "Option 2",
      scores: { Time: 4, Cost: 2, Effort: 4, Impact: 4, Risk: 2 },
    },
  ])
  const [weights, setWeights] = useState<Record<string, number>>({
    Time: 1, Cost: 1, Effort: 1, Impact: 1, Risk: 1,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // 1. Load data from Firestore on mount
  useEffect(() => {
    const loadAnalysis = async () => {
      if (!userId) return
      try {
        const docRef = doc(db, "analyses", userId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setTitle(data.title || "New Decision Analysis")
          setOptions(data.options || [])
          setWeights(data.weights || { Time: 1, Cost: 1, Effort: 1, Impact: 1, Risk: 1 })
        }
      } catch (error) {
        console.error("Error loading analysis:", error)
      } finally {
        setInitialLoading(false)
      }
    }
    loadAnalysis()
  }, [userId])

  // 2. Optimized Save function
  const saveToFirebase = async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      // Using setDoc ensures we overwrite the single 'analysis' document for this user
      await setDoc(doc(db, "analyses", userId), {
        userId,
        title,
        options,
        weights,
        updatedAt: serverTimestamp(),
      })
    } catch (error: any) {
      console.error("Firebase Save Error:", error.message)
      if (error.code === 'permission-denied') {
        alert("Permission denied. Please check your Firestore rules.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const addOption = () => {
    const newOption: Option = {
      id: Date.now().toString(),
      name: `Option ${options.length + 1}`,
      scores: { Time: 3, Cost: 3, Effort: 3, Impact: 3, Risk: 3 },
    }
    setOptions([...options, newOption])
  }

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((opt) => opt.id !== id))
    }
  }

  const updateOptionScore = (id: string, factor: string, value: number) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, scores: { ...opt.scores, [factor]: value } } : opt)))
  }

  const updateOptionName = (id: string, name: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, name } : opt)))
  }

  const calculateScore = (option: Option): number => {
    return factors.reduce((sum, factor) => {
      return sum + option.scores[factor] * (weights[factor] || 1)
    }, 0)
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  const scores = options.map((opt) => ({
    option: opt.name,
    score: calculateScore(opt),
  }))

  const maxScore = Math.max(...scores.map((s) => s.score), 1)
  const rankedOptions = [...scores].sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl font-bold text-white bg-transparent border-b-2 border-slate-700 pb-2 w-full mb-2 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <p className="text-slate-400">Create and analyze different options</p>
        </div>
        <Button 
          onClick={saveToFirebase} 
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-900/20"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving..." : "Save Analysis"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-700/50 p-6 backdrop-blur-sm">
          <div className="space-y-6">
            {options.map((option) => (
              <div key={option.id} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 transition-all hover:bg-slate-800/50">
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={option.name}
                    onChange={(e) => updateOptionName(option.id, e.target.value)}
                    className="text-lg font-semibold text-white bg-slate-700/30 border border-slate-600 rounded px-3 py-1 flex-1 focus:outline-none focus:border-blue-500"
                  />
                  <Button
                    onClick={() => removeOption(option.id)}
                    variant="ghost"
                    className="text-red-400 hover:text-red-500 hover:bg-red-500/10 ml-2"
                    disabled={options.length <= 2}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {factors.map((factor) => (
                    <div key={factor}>
                      <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider">{factor}</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={option.scores[factor]}
                        onChange={(e) => updateOptionScore(option.id, factor, Number.parseInt(e.target.value))}
                        className="w-full cursor-pointer accent-blue-500"
                      />
                      <div className="text-center text-sm font-medium text-blue-400 mt-1">{option.scores[factor]}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <Button
              onClick={addOption}
              variant="outline"
              className="w-full border-dashed border-slate-600 text-slate-400 hover:text-white hover:bg-slate-800/50 bg-transparent py-6"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Option
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-700/50 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-blue-400" />
              Rankings
            </h3>
            <div className="space-y-4">
              {rankedOptions.map((item, idx) => (
                <div key={item.option} className="animate-in slide-in-from-right duration-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-300">
                      {idx + 1}. {item.option}
                    </span>
                    <span className="text-sm font-semibold text-blue-400">{item.score.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(item.score / (maxScore || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">Factor Weights</h3>
            <div className="space-y-4">
              {factors.map((factor) => (
                <div key={factor}>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-slate-400">{factor}</label>
                    <span className="text-xs font-semibold text-purple-400">
                      {weights[factor]}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5" max="3" step="0.5"
                    value={weights[factor]}
                    onChange={(e) =>
                      setWeights({
                        ...weights,
                        [factor]: Number.parseFloat(e.target.value),
                      })
                    }
                    className="w-full cursor-pointer accent-purple-500"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}