"use client";

import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { SplineScene } from "./spline";
import { Spotlight } from "./spotlight";
import { Card, CardContent } from "./card";
import { motion } from "framer-motion";

export default function Demo() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError("");
    setResults("");

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResults(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black antialiased">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl space-y-8"
          >
            <div className="space-y-4">
              <h1 className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl">
                NLABTEAM
              </h1>
              <h2 className="text-2xl font-semibold text-white md:text-3xl">
                Smart Parser
              </h2>
              <p className="text-base text-gray-400 md:text-lg">
                Advanced AI-powered search and analysis tool
              </p>
            </div>

            <Card className="border-gray-800 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Enter your search query..."
                      className="w-full rounded-lg border border-gray-700 bg-black/50 py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      disabled={loading}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Searching...
                      </span>
                    ) : (
                      "Search"
                    )}
                  </button>
                </form>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-400"
                  >
                    {error}
                  </motion.div>
                )}

                {results && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-2"
                  >
                    <h3 className="text-lg font-semibold text-white">Results:</h3>
                    <div className="rounded-lg border border-gray-700 bg-black/30 p-4">
                      <p className="whitespace-pre-wrap text-gray-300">{results}</p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2 text-center text-sm text-gray-500">
              <p>Powered by OpenAI & Spline 3D</p>
            </div>
          </motion.div>
        </div>

        <div className="relative h-[400px] w-full lg:h-screen lg:w-1/2">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
