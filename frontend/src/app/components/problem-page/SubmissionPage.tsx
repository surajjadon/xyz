"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Clock, Database, Code2 } from "lucide-react";
import { getUserSubmissions } from "@/lib/getUserSubmissions";

export default function SubmissionPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubmissions() {
      const data = await getUserSubmissions();
      setSubmissions(data);
      setLoading(false);
    }

    loadSubmissions();
  }, []);

  if (loading) return <div className="p-6">Loading submissions...</div>;

  return (
    <div className="w-full h-full p-6 flex flex-col overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-[#181A1C]">Your Submissions</h2>

      <div className="space-y-4">
        {submissions.length === 0 && (
          <p className="text-sm text-gray-600">No submissions found.</p>
        )}

        {submissions.map((sub: any) => {
          const isOpen = openId === sub._id;

          return (
            <div key={sub._id} className="border border-[#7bcfff] bg-white rounded-xl shadow-sm p-4">
              {/* Submission Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#181A1C] flex items-center gap-1">
                      <Code2 className="w-4 h-4 text-[#00A3FF]" />
                      {sub.language}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-md text-xs font-bold 
                        ${sub.status === "Accepted"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"}
                      `}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-[12px] text-[#4F4F4F]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {sub.runtime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3" /> {sub.memory}
                    </span>
                    <span>• {sub.time}</span>
                  </div>
                </div>

                <button
                  onClick={() => setOpenId(isOpen ? null : sub._id)}
                  className="p-2 hover:bg-slate-100 rounded-md transition"
                >
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#4F4F4F]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#4F4F4F]" />
                  )}
                </button>
              </div>

              {isOpen && (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-md p-3 font-mono text-xs whitespace-pre-wrap text-[#181A1C]">
                  {sub.code}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
