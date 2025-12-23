"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin, Clock, Database, ChevronLeft, List, 
  Lock, CheckCircle, PanelLeftOpen, Send, Play, 
  ThumbsUp, ThumbsDown, Lightbulb, Loader2, 
  CheckCircle2, XCircle, Plus, RotateCcw,
  AlertTriangle, X, ArrowRight, Maximize2, Minimize2, GripVertical,Code
} from "lucide-react";

import Editor from "@monaco-editor/react";

type BaseProblem = {
    slug: string;
    title: string;
    descriptionTemplate: string;
    inputFormat: string;
    outputFormat: string;
    variations: any[];
};

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; 
import VideoSolutionComponent from "./VideoSolution";
import SubmissionPage from "./SubmissionPage";

// --- TYPES ---
interface Problem extends BaseProblem {
  likes?: number;
  dislikes?: number;
  templates?: { language: string; functionName: string; code: string }[];
  videoUrl: string;
  isFree: boolean;
}

type ProblemWorkspaceProps = {
  problem: Problem; 
  initialVariationIndex?: number;
  solvedLevelIds?: string[]; 
};

// --- MARKDOWN COMPONENT ---
const MarkdownContent = ({ content, className = "" }: { content: string, className?: string }) => {
  if (!content) return null;
  return (
    <div className={`text-sm text-slate-700 leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
          code: ({node, ...props}) => <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// --- STARTER CODE ---
const getStarterCode = (lang: string, templates: any[]) => {
  const template = templates?.find(t => t.language === lang);
  if (template) return template.code;
  if (lang === 'C++') return `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`;
  if (lang === 'Java') return `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner s = new Scanner(System.in);\n        if(s.hasNext()) System.out.println("Hello World");\n    }\n}`;
  return `// Write code for ${lang}`;
};

export default function ProblemWorkspace({ 
  problem, 
  initialVariationIndex = 0
}: ProblemWorkspaceProps) {

  const variations = problem?.variations || [];
  const templates = problem?.templates || [];
  const safeInitialIndex = (variations.length > 0 && variations[initialVariationIndex]) ? initialVariationIndex : 0;
  
  // --- STATE ---
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeIndex, setActiveIndex] = useState(safeInitialIndex);
  const [tabs, setTabs] = useState(['OJ', 'Solution', 'Video Solution', 'Submissions']); 
  const [activeTab, setActiveTab] = useState('OJ');
  const [userCountry, setUserCountry] = useState("Locating...");
  
  // Solved State (LocalStorage)
  const [solvedLevelIds, setSolvedLevelIds] = useState<string[]>([]);

  // Test Cases
  const [activeTestCaseId, setActiveTestCaseId] = useState<string>("0");
  const [customCases, setCustomCases] = useState<{id: string, input: string}[]>([
    { id: 'custom-0', input: '' }
  ]);

  // Data
  const [likes, setLikes] = useState(problem.likes || 0);
  const [dislikes, setDislikes] = useState(problem.dislikes || 0);
  const [showHint, setShowHint] = useState(false);

  // Execution
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState<Record<string, any> | null>(null);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const [activeLang, setActiveLang] = useState("C++");
  const [code, setCode] = useState(""); 
  
  // ** Layout Controls **
  const [isEditorFullScreen, setIsEditorFullScreen] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage (50%)
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const failureAudio = useRef<HTMLAudioElement | null>(null);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- RESIZING LOGIC ---
  const startResizing = useCallback(() => setIsDragging(true), []);
  const stopResizing = useCallback(() => setIsDragging(false), []);
  
  const resize = useCallback((e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth > 20 && newWidth < 80) {
        setLeftPanelWidth(newWidth);
      }
    }
  }, [isDragging]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // --- RESPONSIVE INIT ---
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  // --- LOCAL STORAGE EFFECTS ---
  useEffect(() => {
    const savedSolved = localStorage.getItem(`solved-${problem.slug}`);
    if (savedSolved) {
        setSolvedLevelIds(JSON.parse(savedSolved));
    }
  }, [problem.slug]);

  useEffect(() => {
    const key = `code-${problem.slug}-${activeLang}`;
    const savedCode = localStorage.getItem(key);
    const initialCode = savedCode || getStarterCode(activeLang, templates);
    setCode(initialCode);
    if(editorRef.current) editorRef.current.setValue(initialCode);
  }, [activeLang, problem.slug, templates]);

  useEffect(() => {
    if (code) localStorage.setItem(`code-${problem.slug}-${activeLang}`, code);
  }, [code, activeLang, problem.slug]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        successAudio.current = new Audio("/sounds/success.mp3");
        failureAudio.current = new Audio("/sounds/failure.mp3");
    }
    fetch("https://ipapi.co/json/").then(r => r.json()).then(d => setUserCountry(d.country_name)).catch(() => setUserCountry("Unknown"));
  }, []);

  useEffect(() => {
    setShowHint(false);
    setRunResults(null);
    setSubmissionResult(null);
    setActiveTestCaseId("0");
    setCustomCases([{ id: 'custom-0', input: '' }]);
    setTabs(prev => prev.filter(t => t !== 'Result'));
    if(activeTab === 'Result') setActiveTab('OJ');
  }, [activeIndex]);

  const currentVariation = variations[activeIndex];

  const getMonacoLanguage = (lang: string) => {
    if (lang === 'C++') return 'cpp';
    return lang.toLowerCase();
  };

  const processText = (text: string, variables?: Record<string, string>) => {
    if (!text || !variables) return text;
    let processed = text;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value);
    });
    return processed;
  };

  // --- JUDGE0 ---
  const JUDGE0_URL = "http://localhost:2358";
  const LANGUAGE_IDS: Record<string, number> = { "Java": 62, "Python": 71, "C++": 54 };
  
  const decode = (str: string) => {
    if (!str) return "";
    try { return decodeURIComponent(escape(atob(str))); } catch (e) { return ""; }
  };
  const encode = (str: string) => btoa(unescape(encodeURIComponent(str || "")));

  const executeBatch = useCallback(async (testCases: {id: string, input: string, output?: string}[]) => {
    const langId = LANGUAGE_IDS[activeLang];
    const submissions = testCases.map((tc) => ({
      language_id: langId,
      source_code: encode(code),
      stdin: encode(tc.input || "0"), 
      expected_output: tc.output ? encode(tc.output) : null,
      cpu_time_limit: 2, 
      memory_limit: 128000
    }));

    const postRes = await fetch(`${JUDGE0_URL}/submissions/batch?base64_encoded=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissions }),
    });

    if (!postRes.ok) throw new Error("Submission failed to start. Is Judge0 running?");
    const tokens = (await postRes.json()).map((s: any) => s.token).join(",");

    let attempts = 0;
    while (attempts < 10) {
        await new Promise(r => setTimeout(r, 1000));
        const getRes = await fetch(`${JUDGE0_URL}/submissions/batch?tokens=${tokens}&base64_encoded=true&fields=token,status,stdout,stderr,compile_output,time,memory`);
        const data = await getRes.json();
        
        if (data.submissions.every((r: any) => r.status.id >= 3)) {
            return data.submissions.map((sub: any) => ({
                ...sub,
                stdout: sub.stdout ? decode(sub.stdout).substring(0, 1000) : null,
                stderr: sub.stderr ? decode(sub.stderr).substring(0, 1000) : null,
                compile_output: sub.compile_output ? decode(sub.compile_output).substring(0, 2000) : null,
            }));
        }
        attempts++;
    }
    throw new Error("Timeout: Execution took too long.");
  }, [activeLang, code]);

  const handleRun = async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setRunResults(null);
    setExecutionError(null);
    setShowHint(false);

    try {
        const defaultCases = currentVariation.testCases?.slice(0, 2).map((tc: any, i: number) => ({ ...tc, id: i.toString() })) || [];
        const casesToRun = [...defaultCases, ...customCases];
        const results = await executeBatch(casesToRun);
        const resultsMap: Record<string, any> = {};
        results.forEach((r: any, i: number) => { resultsMap[casesToRun[i].id] = r; });
        setRunResults(resultsMap);
    } catch (err: any) {
        setExecutionError(err.message);
    } finally {
        setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (isRunning || isSubmitting) return;
    setIsSubmitting(true);
    setExecutionError(null);

    try {
        const allCases = currentVariation.testCases?.map((tc:any, i:number) => ({...tc, id: i.toString()})) || [];
        const results = await executeBatch(allCases);
        const compileErr = results.find((r: any) => r.status.id === 6);
        const allPassed = !compileErr && results.every((r: any) => r.status.id === 3);
        
        if (allPassed) {
            successAudio.current?.play().catch(() => {});
            const currentLevelId = currentVariation.levelId;
            if (!solvedLevelIds.includes(currentLevelId)) {
                const newSolved = [...solvedLevelIds, currentLevelId];
                setSolvedLevelIds(newSolved);
                localStorage.setItem(`solved-${problem.slug}`, JSON.stringify(newSolved));
            }
        } else {
            failureAudio.current?.play().catch(() => {});
        }

        if (!tabs.includes('Result')) setTabs(prev => [...prev, 'Result']);
        setSubmissionResult({ 
            status: compileErr ? "Compilation Error" : (allPassed ? "Accepted" : "Wrong Answer"),
            total: allCases.length,
            passed: results.filter((r: any) => r.status.id === 3).length,
            details: results,
            compileOutput: compileErr ? compileErr.compile_output : null
        });
        setActiveTab('Result');
    } catch (err: any) {
        setExecutionError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEditorDidMount = (editor: any) => { editorRef.current = editor; };
  const handleResetCode = () => {
    const starter = getStarterCode(activeLang, templates);
    setCode(starter);
    if(editorRef.current) editorRef.current.setValue(starter);
  };
  const addCustomCase = () => {
     const newId = `custom-${Date.now()}`;
     setCustomCases(prev => [...prev, { id: newId, input: '' }]);
     setActiveTestCaseId(newId);
  };
  const removeCustomCase = (e: React.MouseEvent, idToRemove: string) => {
     e.stopPropagation();
     const newCases = customCases.filter(c => c.id !== idToRemove);
     setCustomCases(newCases);
     if (activeTestCaseId === idToRemove) setActiveTestCaseId("0");
  };
  const updateCustomInput = (val: string) => {
      setCustomCases(prev => prev.map(c => c.id === activeTestCaseId ? { ...c, input: val } : c));
  };
  const handleNextLevel = () => {
      const nextIndex = activeIndex + 1;
      if (nextIndex < variations.length) setActiveIndex(nextIndex);
  };

  // --- RENDER RESULT TAB ---
  const renderResultTab = () => {
    if (!submissionResult) return null;
    const isSuccess = submissionResult.status === "Accepted";
    const isError = submissionResult.status === "Compilation Error";
    const hasNextLevel = activeIndex < variations.length - 1;

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <div className={`p-6 border-b ${isSuccess ? "bg-green-50 border-green-100" : isError ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100"}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg shadow-sm ${isSuccess ? "bg-green-100 text-green-600" : isError ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}>
                            {isSuccess ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                        </div>
                        <div>
                            <h2 className={`text-2xl font-bold ${isSuccess ? "text-green-700" : isError ? "text-amber-700" : "text-red-700"}`}>{submissionResult.status}</h2>
                            {!isError && <p className="text-sm font-medium text-slate-500">Passed {submissionResult.passed} / {submissionResult.total} test cases</p>}
                        </div>
                    </div>
                    {isSuccess && hasNextLevel && (
                        <button onClick={handleNextLevel} className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-all active:scale-95 font-bold">
                            Next Level <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {isError ? (
                    <div className="bg-slate-900 text-red-300 p-4 rounded-lg font-mono text-xs whitespace-pre-wrap">{submissionResult.compileOutput}</div>
                ) : (
                    <>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Test Case Breakdown</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {submissionResult.details.map((res: any, i: number) => {
                                const passed = res.status.id === 3;
                                return (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-bold ${passed ? "text-green-600" : "text-red-600"}`}>Case {i + 1}</span>
                                            {!passed && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">{res.status.description}</span>}
                                        </div>
                                        {passed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
  };

  if (!currentVariation) return <div className="p-10 text-red-500">Error: No data.</div>;

  return (
    <>
<style>{`
    /* Default state: Scrollbar takes up space but is invisible */
    .custom-scrollbar::-webkit-scrollbar { 
        width: 5px; 
        height: 5px; 
    }
    .custom-scrollbar::-webkit-scrollbar-track { 
        background: transparent; 
        margin: 4px; 
    }
    .custom-scrollbar::-webkit-scrollbar-thumb { 
        background: transparent; /* Hidden by default */
        border-radius: 20px; 
    }

    /* Show the scrollbar when hovering over the CONTAINER */
    .custom-scrollbar:hover::-webkit-scrollbar-thumb { 
        background: #c7eaff; 
    }

    /* Darker color when hovering over the SCROLLBAR itself */
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
        background: #00A3FF; 
    }

    /* Firefox Support */
    .custom-scrollbar { 
        scrollbar-width: thin; 
        scrollbar-color: transparent transparent; /* Hidden */
    }
    .custom-scrollbar:hover { 
        scrollbar-color: #c7eaff transparent; /* Visible on hover */
    }
`}</style>

    <div className="flex flex-col lg:flex-row gap-6 h-full bg-white lg:overflow-hidden overflow-y-auto custom-scrollbar p-2 lg:py-0 lg:px-2 relative">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (Drawer on Mobile, Static on Desktop) */}
      <aside 
  className={`
      fixed lg:static inset-y-0 left-0 z-50
      bg-[#F7FCFF] lg:rounded-xl shadow-[0_0_8px_rgba(0,163,255,0.15)]
      border-[1.5px] border-[#7bcfff]
      flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out overflow-hidden
      ${isSidebarOpen 
        ? "translate-x-0 w-[280px] lg:w-[260px] opacity-100" 
        : "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:shadow-none"
      }
  `}
>
  <div className="absolute inset-0 p-[1.5px] rounded-xl pointer-events-none hidden lg:block">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#00A3FF] via-[#00a3FF] to-[#FFFFFF] p-1"></div>
      <div className="absolute inset-0 rounded-xl bg-[#F7FCFF] m-[1.5px]"></div>
  </div>

  <div className="w-full lg:w-[260px] flex flex-col h-full relative z-10 bg-[#F7FCFF]">
    <div className="px-3 pt-3 pb-1">
       <div className="relative bg-white rounded-xl shadow-sm border border-slate-100 p-1">
          <div className="relative bg-white rounded-lg px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                  <List className="w-4 h-4 text-[#00A3FF]" /> 
                  <span>Variations</span>
              </div>
              <button 
                  onClick={() => setSidebarOpen(false)} 
                  className="p-1 text-slate-400 hover:text-[#00A3FF] hover:bg-sky-50 rounded-md transition-all cursor-pointer"
              >
                  <ChevronLeft className="w-5 h-5" />
              </button>
          </div>
       </div>
    </div>

    {/* Variations List */}
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 custom-scrollbar">
      {variations.map((variation, index) => {
        const isActive = index === activeIndex;
        // Logic: Is locked if index > 0 and previous level is NOT solved
        const isLocked = index > 0 && !solvedLevelIds.includes(variations[index - 1].levelId);
        
        // Determine Status Icon
        let Icon = Code; // Default
        let iconColorClass = "text-sky-500";
        
        if (isLocked) {
            Icon = Lock;
            iconColorClass = "text-slate-400";
        } else if (solvedLevelIds.includes(variation.levelId)) {
            Icon = CheckCircle2; // Changed to CheckCircle2 to match prev component
            iconColorClass = "text-green-500";
        }

        return (
          <button 
            key={variation.levelId || index} 
            disabled={isLocked} 
            onClick={() => { 
                if(!isLocked) {
                    setActiveIndex(index); 
                    if(typeof window !== 'undefined' && window.innerWidth < 1024) {
                        setSidebarOpen(false); 
                    }
                }
            }} 
            className={`
                w-full relative group flex items-center p-3 rounded-xl transition-all duration-200 border text-left
                ${isActive 
                    ? "bg-[#D9F1FF] border-sky-200 ring-1 ring-sky-200 shadow-sm" 
                    : "bg-white border-[#D9F1FF] hover:border-sky-200 hover:shadow-md"
                }
                ${isLocked ? "opacity-60 cursor-not-allowed bg-slate-50 grayscale" : "cursor-pointer"}
            `}
          >
            {/* Icon Box */}
            <div className={`
                w-9 h-9 shrink-0 rounded-lg border flex items-center justify-center mr-3 transition-colors shadow-sm
                ${isActive 
                    ? "bg-white border-sky-100" 
                    : "bg-white border-slate-100 group-hover:border-sky-100"
                }
            `}>
                <Icon className={`w-4 h-4 ${iconColorClass}`} />
            </div>

            {/* Text Content */}
           <div className="flex flex-col min-w-0">
    {/* Title */}
    <span className={`text-sm font-bold truncate leading-tight ${isActive ? "text-[#181A1C]" : "text-slate-700"}`}>
        {variation.title}
    </span>

    {/* Status Row with Icons */}
    <div className={`flex items-center gap-1 text-[10px] font-medium mt-0.5 truncate ${
        isLocked 
            ? "text-slate-400" 
            : solvedLevelIds.includes(variation.levelId) 
            ? "text-green-500" 
            : "text-amber-500"
    }`}>
        {/* Only show icons if NOT locked */}
        {!isLocked && (
            solvedLevelIds.includes(variation.levelId) 
            ? <CheckCircle2 className="w-3 h-3" /> 
            : <Clock className="w-3 h-3" />
        )}

        <span>
            {isLocked 
                ? "Complete previous level" 
                : (solvedLevelIds.includes(variation.levelId) ? "Completed" : "In Progress")
            }
        </span>
    </div>
</div>
            
            {/* Active Indicator Dot (Optional decoration) */}
           {isActive && !isLocked && (
    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_2px_rgba(14,165,233,0.6)]"></div>
)}
          </button>
        );
      })}
    </div>
  </div>
</aside>
      {/* --- RESIZABLE CONTAINER --- */}
      <div 
        ref={containerRef}
        className={`flex-1 flex flex-col lg:flex-row min-w-0 h-full relative ${isDragging ? "select-none" : ""}`}
      >
        
        {/* CENTER PANEL (Description) */}
        {!isEditorFullScreen && (
        <div 
   // 1. Pass the dynamic width as a CSS variable (safe for server)
   style={{ '--panel-width': `${leftPanelWidth}%` } as React.CSSProperties}
   
   // 2. Use Tailwind to handle the switch:
   className="w-full lg:w-[var(--panel-width)] flex flex-col h-auto lg:h-full gap-6 min-h-[500px] shrink-0 lg:pr-1 min-w-0"
>
            {/* Tabs Row */}
            <div className="h-10 lg:h-[6%] w-full flex gap-2">
              {!isSidebarOpen && <button onClick={() => setSidebarOpen(true)} className="h-full aspect-square bg-[#00A3FF26] rounded-lg flex items-center justify-center text-[#4F4F4F] hover:bg-[#00A3FF40] transition-colors cursor-pointer"><PanelLeftOpen className="w-5 h-5" /></button>}
              <div className="flex-1 bg-[#00A3FF26] rounded-lg flex items-center justify-start lg:justify-center gap-2 lg:gap-4 overflow-x-auto no-scrollbar px-1 custom-scrollbar">
                {tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap px-4 lg:px-8 py-1.5 rounded-md transition-all duration-200 cursor-pointer text-xs lg:text-sm ${activeTab === tab ? "bg-white text-[#4F4F4F] font-semibold shadow-sm" : "text-gray-600 font-medium hover:text-[#4F4F4F] bg-transparent"}`}>{tab}</button>)}
              </div>
            </div>
            
            {/* Header Info */}
            <div className="w-full h-auto bg-white rounded-lg border-[1px] border-[#7bcfff] overflow-hidden shrink-0 shadow-sm transition-all">
  {/* Main Container */}
  <div className="flex flex-col w-full p-4 gap-4 lg:gap-2">
    
    {/* Top Row: Title & Date */}
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2">
      {/* Title - Takes available space */}
      <div className="flex-1 text-xl md:text-2xl lg:text-[28px] font-medium text-[#181A1C] leading-tight break-words">
        {problem.title}
      </div>

      {/* Date - Shrinks to fit content */}
      <div className="shrink-0 flex items-center justify-start lg:justify-end text-[#00A3FF] gap-2">
        <span className="hidden lg:inline text-2xl leading-none">•</span>
        <span className="text-sm lg:text-base font-medium">2024</span>
      </div>
    </div>

    {/* Bottom Row: Tags */}
    <div className="flex items-center w-full">
      <div className="w-full flex flex-wrap items-center justify-start gap-2 lg:gap-3">
        
        {/* Country Tag */}
        <div className="bg-[#00A3FF1A] px-3 py-2 rounded-lg text-xs md:text-sm text-[#4F4F4F] flex items-center font-medium gap-2 whitespace-nowrap">
          <MapPin className="w-3 h-3 md:w-4 md:h-4 text-[#4F4F4F]" /> 
          {userCountry}
        </div>

        {/* Time Tag */}
        <div className="bg-[#00A3FF1A] px-3 py-2 rounded-lg text-xs md:text-sm text-[#4F4F4F] flex items-center font-medium gap-2 whitespace-nowrap">
          <Clock className="w-3 h-3 md:w-4 md:h-4 text-[#4F4F4F]" /> 
          {currentVariation?.timeLimit}
        </div>

        {/* Memory Tag */}
        <div className="bg-[#00A3FF1A] px-3 py-2 rounded-lg text-xs md:text-sm text-[#4F4F4F] flex items-center font-medium gap-2 whitespace-nowrap">
          <Database className="w-3 h-3 md:w-4 md:h-4 text-[#4F4F4F]" /> 
          {currentVariation?.memoryLimit}
        </div>
        
      </div>
    </div>
  </div>
</div>
            
            {/* Main Content (Scrollable) */}
            <div className="h-[500px] lg:h-[77%] w-full bg-white rounded-lg border-[1.5px] border-[#7bcfff] flex flex-col overflow-hidden">
            {activeTab === "Submissions" ? <SubmissionPage /> : activeTab === "Video Solution" ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <VideoSolutionComponent videoUrl={problem.videoUrl} />
                </div>
            ) : activeTab === "Result" ? (
                <div className="flex-1 overflow-hidden">{renderResultTab()}</div>
            ) : ( 
              //start
              <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
                {/* Description */}
                <div>
                    <h3 className="font-medium text-lg mb-2 text-[#181A1C]">Description</h3>
                    <MarkdownContent className="text-[#373737]" content={currentVariation?.customDescription || processText(problem.descriptionTemplate, currentVariation?.variables)} />
                </div>

                {/* Input Format */}
                <div>
                    <h3 className="font-medium text-base mb-2 text-[#181A1C]">Input Format</h3>
                    <MarkdownContent className="text-[#373737]" content={problem.inputFormat} />
                </div>

                {/* Output Format */}
                <div>
                    <h3 className="font-medium text-base mb-2 text-[#181A1C]">Output Format</h3>
                    <MarkdownContent className="text-[#373737]" content={problem.outputFormat} />
                </div>

                {/* Constraints */}
                <div>
                    <h3 className="font-medium text-base mb-2 text-[#181A1C]">Constraints</h3>
                    <div className="bg-slate-50 border border-slate-100 rounded-md p-3">
                        <MarkdownContent className="text-[#373737]" content={currentVariation?.constraints} className="font-mono text-xs" />
                    </div>
                </div>

                {/* NEW: Sample Test Cases with Explanation */}
                <div>
                    <h3 className="font-medium text-base mb-3 text-[#181A1C]">Sample Test Cases</h3>
                    <div className="flex flex-col gap-6">
                        {currentVariation?.testCases?.slice(0, 2).map((testCase: any, i: number) => (
                            <div key={i} className="flex flex-col gap-3">
                                <div className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-1">Sample {i + 1}</div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Input */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Input</span>
                                        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 font-mono text-xs text-slate-700 whitespace-pre-wrap">
                                            {testCase.input}
                                        </div>
                                    </div>
                                    {/* Output */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Output</span>
                                        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 font-mono text-xs text-slate-700 whitespace-pre-wrap">
                                            {testCase.output}
                                        </div>
                                    </div>
                                </div>

                                {/* Explanation */}
                                {testCase.explanation && (
                                    <div className="bg-[#00A3FF26] border-[1.5px] border-[#7bcfff] rounded-md p-3">
                                        <span className="text-xs font-bold text-slate-500 block mb-1">Explanation:</span>
                                        <MarkdownContent className="text-slate-700 text-xs" content={testCase.explanation} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
              </div>
              //end
            )}
            </div>
          </div>
        )}

        {/* --- DRAG HANDLE (Only on Desktop & Not Fullscreen) --- */}
        {!isEditorFullScreen && (
          <div 
             onMouseDown={startResizing}
             className="hidden lg:flex w-2 lg:w-4 items-center justify-center cursor-col-resize hover:bg-[#00A3FF1A] transition-colors group z-10 shrink-0"
          >
             <div className="h-8 w-1 bg-slate-200 rounded-full group-hover:bg-[#00A3FF]"></div>
          </div>
        )}
             
        {/* RIGHT PANEL (Editor & Results) */}
       <div 
   style={{ '--right-panel-width': `${100 - leftPanelWidth}%` } as React.CSSProperties}
   className={`
      flex flex-col h-auto lg:h-full gap-4 min-h-[600px] shrink-0 min-w-0 transition-all duration-75 pr-4
      ${isEditorFullScreen 
        ? "fixed inset-0 z-50 bg-white p-4 w-full h-full" 
        : "w-full lg:w-[var(--right-panel-width)] relative"
      }
   `}
>
          {/* Language & Actions & Fullscreen Toggle */}
          <div className="h-10 lg:h-[6%] bg-[#00A3FF26] rounded-lg flex items-center justify-between px-2 gap-2 lg:gap-4 shrink-0 pr-2">
             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar custom-scrollbar">
                {[{ id: 'Java', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },{ id: 'Python', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },{ id: 'C++', isCodeIcon: true }].map((lang) => {
                  const isActive = activeLang === lang.id;
                  return (<button key={lang.id} onClick={() => setActiveLang(lang.id)} className={`flex items-center gap-2 px-3 lg:px-4 py-1.5 rounded transition-all duration-200 text-xs cursor-pointer text-[#181A1C] hover:text-[#181A1C] ${isActive ? "bg-white font-bold shadow-sm border border-sky-200" : "font-medium hover:bg-[#FFFFFF]"}`}>{lang.isCodeIcon ? (<span className={`font-mono font-bold text-[10px] text-[#181A1C] ${isActive ? "" : "opacity-60"}`}>&lt;/&gt;</span>) : (<img src={lang.iconUrl} alt={lang.id} className={`w-4 h-4 transition-all ${isActive ? "" : "grayscale opacity-60"}`} />)}{lang.id}</button>);
                })}
             </div>
             
             {/* Full Screen Toggle Button (Inside a Box) */}
             <button 
                onClick={() => setIsEditorFullScreen(!isEditorFullScreen)}
                className="bg-white p-1.5 rounded-md border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-600 hover:text-sky-600 transition-all cursor-pointer"
                title={isEditorFullScreen ? "Minimize" : "Full Screen"}
             >
                {isEditorFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
             </button>
          </div>
          
          {/* Code Editor */}
          <div className="flex-1 flex flex-col bg-white rounded-xl border-[1.5px] border-[#7bcfff] overflow-hidden shadow-sm relative min-h-[400px]">
             <div className="h-10 bg-sky-100 flex items-center justify-between px-4 border-b border-sky-200 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/20"></div><div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20"></div><div className="w-3 h-3 rounded-full bg-green-500 border border-green-600/20"></div></div>
                    <span className="text-xs font-bold text-[#181A1C]">{activeLang === 'C++' ? 'C++' : activeLang} Editor</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleResetCode} className="cursor-pointer text-xs text-slate-400 hover:text-sky-500 flex items-center gap-1 transition-colors"><RotateCcw className="w-3 h-3"/> Reset</button>
                    <span className={`text-[10px] font-mono ${code.length >= 10000 ? "text-red-500 font-bold" : "text-slate-500"}`}>{code.length}/10000</span>
                </div>
             </div>
             <div className="flex-1 relative pt-2">
                 <Editor 
                    height="100%" 
                    defaultLanguage="java" 
                    language={getMonacoLanguage(activeLang)} 
                    theme="light" 
                    defaultValue={getStarterCode("Java", templates)}
                    onMount={handleEditorDidMount}
                    onChange={(value) => setCode(value || "")} 
                    options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: "on", roundedSelection: false, scrollBeyondLastLine: false, readOnly: isRunning || isSubmitting, padding: { top: 16 }, fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace', overviewRulerBorder: false }} 
                 />
             </div>
          </div>
          
          {/* Action Bar (Run/Submit) */}
          <div className="h-auto py-2 lg:h-[60px] bg-[#00A3FF26] rounded-lg flex flex-wrap items-center justify-between px-3 border border-sky-100 shrink-0 gap-2">
               <div className="flex items-center gap-1"><button className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-white border border-sky-200 rounded text-sky-500 text-xs font-bold"><ThumbsUp className="w-3.5 h-3.5" /> {likes}</button><button className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-white border border-sky-200 rounded text-slate-400 text-xs font-medium"><ThumbsDown className="w-3.5 h-3.5" /> {dislikes}</button></div>
               <button onClick={() => setShowHint(!showHint)} className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded shadow-md transition-all active:scale-95 cursor-pointer ${showHint ? "bg-amber-100 text-amber-600 border border-amber-200" : "bg-[#00A3FF] hover:bg-sky-600 text-white"}`}><Lightbulb className="w-3.5 h-3.5 " /> Hint</button>
               <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                  <button onClick={handleRun} disabled={isRunning || isSubmitting} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-sky-600 border border-sky-200 text-xs font-bold rounded shadow-sm transition-all hover:bg-white active:scale-95 cursor-pointer disabled:opacity-50">{isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />} Run</button>
                  <button onClick={handleSubmit} disabled={isRunning || isSubmitting} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#00A3FF] hover:bg-sky-600 text-white text-xs font-bold rounded shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50">{isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Submit</button>
               </div>
          </div>

          {/* Bottom Panel (Test Cases) */}
          <div className="h-[300px] lg:h-[30%] bg-white rounded-xl border-[1.5px] border-[#7bcfff] shadow-sm flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center bg-slate-50/50 overflow-x-auto no-scrollbar gap-1 custom-scrollbar">
                 <h3 className="font-bold text-slate-800 text-sm mr-2 shrink-0">Test Cases</h3>
                 {["0", "1"].map(id => {
                     const res = runResults?.[id];
                     const dotClass = res ? (res.status.id===3 ? "bg-green-500 shadow-green-500/50" : res.status.id===6 ? "bg-amber-500" : "bg-red-500 shadow-red-500/50") : "bg-slate-300";
                     return (
                       <button key={id} onClick={() => setActiveTestCaseId(id)} className={`cursor-pointer relative shrink-0 px-3 py-1.5 rounded-t-md text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${activeTestCaseId === id ? "border-sky-500 text-sky-700 bg-white" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}>
                          Case {parseInt(id) + 1}
                          <div className={`w-1.5 h-1.5 rounded-full ${dotClass} shadow-sm transition-colors`}></div>
                       </button>
                     )
                 })}
                 {customCases.map((c, i) => {
                     const res = runResults?.[c.id];
                     const dotClass = res ? (res.status.id===3 ? "bg-green-500" : res.status.id===6 ? "bg-amber-500" : "bg-red-500") : "bg-slate-300";
                     return (
                       <div key={c.id} onClick={() => setActiveTestCaseId(c.id)} className={`cursor-pointer group relative shrink-0 px-3 py-1.5 rounded-t-md text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${activeTestCaseId === c.id ? "border-sky-500 text-sky-700 bg-white" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}>
                          Custom {i + 1}
                          <div className={`w-1.5 h-1.5 rounded-full ${dotClass} shadow-sm transition-colors`}></div>
                          <button onClick={(e) => removeCustomCase(e, c.id)} className="cursor-pointer ml-1 opacity-0 group-hover:opacity-100 hover:bg-slate-200 rounded p-0.5 transition-all"><X className="w-3 h-3" /></button>
                       </div>
                     )
                 })}
                 <button onClick={addCustomCase} className="cursor-pointer ml-2 p-1 rounded hover:bg-sky-100 text-sky-600 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              
              <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-white custom-scrollbar">
                 {showHint ? (
                   <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg text-sm text-slate-700 leading-relaxed shadow-sm">
                      <div className="font-bold text-amber-600 mb-1 flex items-center gap-2"><Lightbulb className="w-4 h-4"/> Hint</div>
                      {(currentVariation as any).hints?.[0] || "No specific hints available for this level."}
                   </div>
                 ) : (
                   <div className="flex flex-col gap-4 h-full">
                      <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Input</span>
                          {activeTestCaseId.startsWith('custom') ? (
                              <textarea value={customCases.find(c => c.id === activeTestCaseId)?.input || ''} onChange={(e) => updateCustomInput(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono h-20 resize-none focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-50 transition-all custom-scrollbar" placeholder="Enter custom input here..." />
                          ) : (
                              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-700 whitespace-pre-wrap">{currentVariation.testCases?.[parseInt(activeTestCaseId)]?.input}</div>
                          )}
                      </div>

                      <div className="flex-1 grid grid-cols-2 gap-4">
                           {!activeTestCaseId.startsWith('custom') && (
                               <div className="flex flex-col gap-1.5">
                                   <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Expected Output</span>
                                   <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-700 whitespace-pre-wrap h-full custom-scrollbar">{currentVariation.testCases?.[parseInt(activeTestCaseId)]?.output}</div>
                               </div>
                           )}

                           <div className={`flex flex-col gap-1.5 ${activeTestCaseId.startsWith('custom') ? "col-span-2" : ""}`}>
                               <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your Output</span>
                               {runResults?.[activeTestCaseId] ? (
                                   (() => {
                                       const res = runResults[activeTestCaseId];
                                       const isPass = res.status.id === 3;
                                       const isErr = res.status.id === 6;
                                       return (
                                          <div className={`p-3 rounded-lg border text-xs font-mono h-full overflow-auto relative custom-scrollbar ${isPass ? "bg-green-50 border-green-200 text-green-800" : isErr ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                                              {!isPass && <div className="font-bold mb-1 text-[10px] uppercase opacity-70">{res.status.description}</div>}
                                              <div className="whitespace-pre-wrap">{isErr ? (res.compile_output || "Unknown Error") : (res.stdout || res.stderr || "No Output")}</div>
                                          </div>
                                       )
                                   })()
                               ) : (
                                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-400 italic h-full flex items-center justify-center">Run code to see output</div>
                               )}
                           </div>
                      </div>
                   </div>
                 )}
              </div>
          </div>
        </div>
        
      </div>
    </div>
    </>
  );
}