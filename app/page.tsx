'use client'

import { useState } from 'react'
import { SplineScene } from "@/components/ui/splite"
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { Search } from 'lucide-react'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery
        })
      })
      
      if (!response.ok) throw new Error('API request failed')
      
      const data = await response.json()
      setResults(data.result)
    } catch (error) {
      console.error('Search error:', error)
      setResults('Ошибка при выполнении запроса')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        <Card className="w-full h-[600px] bg-black/[0.96] relative overflow-hidden">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />
          
          <div className="flex flex-col md:flex-row h-full">
            <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                NLABTEAM Smart Parser 
              </h1>
              <p className="mt-4 text-neutral-300 max-w-lg">
                Покажи роботу что искать и он все найдет, выделит доступные места для рекламы, и составит письмо, тебе останется только отправить его.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Введите URL сайта или запрос..."
                      className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 text-white rounded-lg transition-colors"
                  >
                    {loading ? 'Ищу...' : 'Найти'}
                  </button>
                </div>
                
                {results && (
                  <div className="mt-4 p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
                    <p className="text-neutral-200 whitespace-pre-wrap">{results}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 relative min-h-[300px]">
              <SplineScene 
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
