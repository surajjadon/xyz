"use client";

import Header from "../../header"; 
import Loading from "./../../loading";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation"; 
import { 
  ChevronLeft, ChevronDown, CheckCircle, Clock, 
  ThumbsUp, ThumbsDown, Bookmark, Check, ChevronUp,CheckCircle2, Code, PlayCircle, Eye
} from "lucide-react";
import { getModule, Module, ModuleItem } from "@/lib/Lesson"; 

type CodingPlatformProps = {
  data: Module;
};

const CodingPlatform = ({ data }: CodingPlatformProps) => {
  const router = useRouter(); 
  
  const [activeItem, setActiveItem] = useState<ModuleItem | null>(
    data.problems.length > 0 ? data.problems[0] : null
  );
  
  const [activeTab, setActiveTab] = useState('Video');
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [counts, setCounts] = useState({ likes: 0, dislikes: 0 });
  
  // Mobile Dropdown State
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  useEffect(() => {
    if (activeItem) {
      setCounts({
        likes: activeItem.problemId.likes || 0,
        dislikes: activeItem.problemId.dislikes || 0
      });
      setUserVote(null); 
    }
  }, [activeItem]);

  const handleVote = (type: 'like' | 'dislike') => {
    setUserVote((prevVote) => {
      let newVote = prevVote;
      let newLikes = counts.likes;
      let newDislikes = counts.dislikes;
      if (prevVote === type) {
        newVote = null;
        if (type === 'like') newLikes--;
        if (type === 'dislike') newDislikes--;
      } else {
        newVote = type;
        if (type === 'like') { newLikes++; if (prevVote === 'dislike') newDislikes--; } 
        else if (type === 'dislike') { newDislikes++; if (prevVote === 'like') newLikes--; }
      }
      setCounts({ likes: newLikes, dislikes: newDislikes });
      return newVote;
    });
  };

  const getStatusIcon = (index: number) => {
    return index === 0 
      ? <CheckCircle className="w-6 h-6 lg:w-8 lg:h-8 text-green-500" /> 
      : <Clock className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500" />;
  };

  // --- REUSABLE DROPDOWN COMPONENT ---
  const DifficultyDropdown = () => (
    <div className="relative z-30"> 
      <div 
        onClick={() => setIsDifficultyOpen(!isDifficultyOpen)}
        className="bg-[#F7FCFF] lg:rounded-xl border-[1.5px] border-[#7bcfff] rounded-xl p-3 lg:p-4 flex justify-between items-center cursor-pointer font-medium hover:bg-white transition-colors text-[#373737] text-sm lg:text-base select-none"
      >
        <span>{selectedDifficulty === "All" ? "Select Difficulty" : selectedDifficulty}</span>
        {isDifficultyOpen ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5" />}
      </div>

      {isDifficultyOpen && (
         <div className="absolute top-full left-0 w-full mt-2 bg-white border-[1.5px] border-[#7bcfff] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
           {["All", "Medium", "Hard", "Easy"].map((diff) => (
             <div 
              key={diff}
              onClick={() => { setSelectedDifficulty(diff); setIsDifficultyOpen(false); }}
              className="p-3 hover:bg-[#F7FCFF] cursor-pointer border-b border-gray-100 last:border-none text-[#373737] px-4"
             >
               {diff}
             </div>
           ))}
         </div>
      )}
    </div>
  );

  if (!activeItem) return <div className="text-gray-500">No problems found.</div>;

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

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full w-full lg:min-h-[500px] rounded-xl p-4 lg:p-8 shadow-sm lg:shadow-lg bg-white lg:bg-transparent overflow-x-auto custom-scrollbar">
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-full lg:w-[450px] shrink-0 flex flex-col gap-4 order-2 lg:order-1 min-w-0">
          
          {/* DESKTOP ONLY Dropdown */}
          <div className="hidden lg:block">
             <DifficultyDropdown />
          </div>

          {/* List Container */}
<div className="bg-[#F7FCFF] lg:rounded-xl border-[1.5px] border-[#7bcfff] rounded-xl p-3 lg:p-4 flex flex-col gap-3 h-[400px] lg:h-full overflow-y-auto custom-scrollbar pr-2">
  {data.problems.map((item, index) => {
    const isActive = activeItem._id === item._id;
    // Mocking status logic based on your image (You can replace this with item.status)
    const isComplete = index % 2 === 0; // Example logic
    const statusColor = isComplete ? "text-green-500" : "text-amber-500";
    const StatusIcon = isComplete ? CheckCircle2 : Clock;
    const statusText = isComplete ? "Complete" : "Pending";

    return (
      <div
        key={item._id}
        onClick={() => {
          setActiveItem(item);
          if (window.innerWidth < 1024) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        className={`
          relative group flex items-center p-3 lg:p-4 rounded-xl cursor-pointer border transition-all duration-200 shadow-sm
          ${isActive
            ? "bg-[#D9F1FF] border-sky-100 ring-1 ring-sky-100 shadow-md"
            : "bg-white border-[#D9F1FF] hover:border-[#D9F1FF] hover:shadow-md"
          }
        `}
      >
        {/* Left: Code Icon Box */}
        <div className="w-10 h-10 lg:w-12 lg:h-12 shrink-0 rounded-xl border border-slate-100 bg-white flex items-center justify-center mr-3 lg:mr-4 shadow-sm group-hover:border-sky-100 transition-colors">
          <Code className="w-5 h-5 lg:w-6 lg:h-6 text-sky-500" />
        </div>

        {/* Middle: Title & Status */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <div className="text-sm lg:text-base font-bold text-slate-800 truncate leading-tight">
            {item.problemId.title}
          </div>
          
          <div className={`flex items-center gap-1.5 text-xs font-medium ${statusColor}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusText}</span>
          </div>
        </div>

        {/* Right: Actions & Stats */}
        <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="text-slate-400 hover:text-sky-500 transition-colors">
               <PlayCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            <button className="text-slate-400 hover:text-sky-500 transition-colors">
               <Bookmark className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>

          {/* View Count */}
          <div className="flex items-center gap-1 text-slate-400 text-[10px] lg:text-xs font-medium">
            <Eye className="w-3 h-3" />
            <span>4.6K</span>
          </div>
          
        </div>
      </div>
    );
  })}
</div>
          
        </aside>

        {/* --- RIGHT MAIN CONTENT --- */}
        <main className="flex-1 flex flex-col gap-4 order-1 lg:order-2 min-w-0">
          
          {/* Tabs */}
          <div className="flex w-full max-w-[500px] gap-2 lg:gap-4 justify-between bg-[#00A3FF1A] p-2 lg:p-3 rounded-lg mx-auto">
            {['Video', 'Solution', 'Problem'].map((tab) => (
              <button 
                key={tab}
                className={`flex-1 px-3 lg:px-5 py-2 text-xs lg:text-sm font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab 
                  ? 'bg-white text-[#181A1C] shadow-sm' 
                  : 'bg-transparent text-[#181A1C] hover:text-gray-700'
                }`}
                onClick={() => {
                  if (tab === 'Problem') {
                    router.push(`/problem/${activeItem?.problemId?.slug}/v1`);
                  } else {
                    setActiveTab(tab);
                  }
                }}
              >
                {tab === 'Video' ? 'Video Solution' : tab === 'Solution' ? 'Solution' : tab}
              </button>
            ))}
          </div>

          {/* MOBILE ONLY Dropdown */}
          <div className="block lg:hidden">
             <DifficultyDropdown />
          </div>

          {/* Reduced padding p-3 on mobile to save space */}
          <div className="bg-white border-[1.5px] border-[#7bcfff] rounded-xl p-3 lg:p-5 h-full flex flex-col shadow-sm">
            
            {/* Title - Reduced margin on mobile */}
            <div className="mb-3 lg:mb-4 text-base lg:text-lg font-medium text-[#181A1C] line-clamp-1">
              {activeItem.problemId.title}
            </div>

            {/* VIDEO PLAYER FIX: 
               - Mobile: Fixed height h-[210px] (Reduces vertical space significantly)
               - Desktop: lg:aspect-video (Standard 16:9)
            */}
            <div className="relative w-full h-[240px] sm:h-[280px] lg:h-[450px] lg:aspect-video bg-black rounded-xl overflow-hidden shadow-md z-10">
               {activeItem.problemId.videoUrl ? (
                 <iframe 
                   src={activeItem.problemId.videoUrl} 
                   title={activeItem.problemId.title}
                   className="w-full h-full absolute inset-0"
                   frameBorder="0"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                 />
               ) : (
                 <div className="flex items-center justify-center h-full text-white">
                   <p>No video available.</p>
                 </div>
               )}
            </div>

            {/* Footer Buttons */}
            {/* Added flex-wrap and reduced gaps to fit everything without overflow */}
            <div className="mt-4 lg:mt-5 bg-[#00A3FF26] border-[1px] border-[#7bcfff] p-3 rounded-lg flex flex-col sm:flex-row flex-wrap justify-between items-center gap-3 lg:gap-4">
              
              {/* Like/Dislike Group */}
              <div className="flex w-full sm:w-auto justify-between sm:justify-start items-center gap-3 bg-white rounded-lg px-3 py-2 text-sm text-[#00A3FF] font-medium shadow-sm">
                <button onClick={() => handleVote('like')} className="flex items-center gap-1.5 hover:text-[#00A3AA] cursor-pointer">
                  <ThumbsUp className="w-4 h-4" fill={userVote === 'like' ? "currentColor" : "none"} /> {counts.likes}
                </button>
                <span className="w-px h-4 bg-gray-300"></span>
                <button onClick={() => handleVote('dislike')} className="flex items-center gap-1.5 hover:text-[#00A3AA] cursor-pointer">
                  <ThumbsDown className="w-4 h-4" fill={userVote === 'dislike' ? "currentColor" : "none"} /> {counts.dislikes}
                </button>
              </div>

              {/* Action Buttons Group */}
              <div className="flex w-full sm:w-auto gap-2">
                <button className="flex-1 sm:flex-none justify-center px-4 py-2 bg-white text-[#00A3FF] rounded-lg text-sm font-medium cursor-pointer hover:text-[#00A3AA] flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
                  <Bookmark className="w-4 h-4" /> <span className="inline">Bookmark</span>
                </button>
                <button className="flex-1 sm:flex-none justify-center px-4 py-2 bg-white text-[#00A3FF] rounded-lg text-sm font-medium cursor-pointer hover:text-[#00A3AA] flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
                  <Check className="w-4 h-4" /> Solved
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default function ModulePage() {
    const params = useParams(); 
    const slug = params?.slug as string;
  
    const [moduleData, setModuleData] = useState<Module | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      if (!slug) return;
      const fetchData = async () => {
        setIsLoading(true);
        const data = await getModule(slug);
        if (data) setModuleData(data);
        setIsLoading(false);
      };
      fetchData();
    }, [slug]);
  
    if (isLoading) return <Loading />;
    if (!moduleData) return <div className="p-10 text-center text-red-500">Module not found</div>;
  
    return (
      <div className="flex flex-col h-screen font-sans bg-white overflow-hidden">
        <Header />
        
        {/* Main Content Wrapper */}
        <div className="flex flex-col gap-4 lg:gap-6 px-4 lg:px-10 py-4 lg:py-6 flex-1 overflow-y-auto lg:overflow-hidden">
          
          {/* --- HEADER SECTION --- */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between shrink-0 mb-2 gap-2 lg:gap-0">
            
            {/* Title Group */}
            <div className="relative flex items-center justify-center lg:justify-start w-full lg:w-auto min-h-[40px]">
                {/* Back Button */}
                <div className="absolute left-0 lg:static p-2 cursor-pointer hover:bg-gray-100 rounded-lg">
                     <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
                </div>
                
                {/* Title */}
                <span className="text-[#181A1C] font-bold text-3xl lg:text-3xl text-center">
                    {moduleData.title}
                </span>
            </div>

            {/* Progress Group */}
            <div className="flex items-center justify-center lg:justify-end">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-[3px] border-[#00A3FF] border-t-transparent -rotate-45" /> 
                    <span className="text-[#181A1C] font-bold text-base lg:text-lg">50%</span>
                </div>
            </div>

          </div>
          {/* --- END HEADER --- */}

          <div className="w-full flex-1 min-h-0 pt-2 lg:pt-4">
             <CodingPlatform data={moduleData} /> 
          </div>
        </div>
      </div>
    );
}