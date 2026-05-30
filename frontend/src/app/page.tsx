"use client";

import { useState, useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";
import WorkflowStepper from "@/components/WorkflowStepper";
import DashboardHeader from "@/components/DashboardHeader";

export default function Home() {
  const [intentId, setIntentId] = useState<number | null>(null);
  const [workflow, setWorkflow] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleIntentFound = async (id: number) => {
    setIntentId(id);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/workflow/${id}`);
      if (res.ok) {
        const data = await res.json();
        setWorkflow(data);
      }
    } catch (err) {
      console.error("Failed to fetch workflow", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Chat */}
        <div className="w-1/3 border-r bg-white flex flex-col">
          <ChatInterface onIntentFound={handleIntentFound} />
        </div>

        {/* Right Side: Workflow/Dashboard */}
        <div className="flex-1 bg-slate-50 overflow-y-auto p-8">
          {intentId ? (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Your Personalized Roadmap</h2>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <WorkflowStepper workflow={workflow} />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-12">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Welcome to Saarthi AI</h2>
              <p className="text-slate-600 text-lg max-w-md">
                Tell me what you want to do (e.g., "I want to open a tea shop") in the chat, and I'll build your government roadmap.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
