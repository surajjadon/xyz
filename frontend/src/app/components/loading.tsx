"use client";

import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white gap-8">
      
      {/* --- THE ANIMATION --- */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        
        {/* 1. Background Grid Pulse (Subtle depth) */}
        <div className="absolute inset-0 bg-[#00A3FF] opacity-[0.03] rounded-full animate-ping-slow"></div>

        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <defs>
            {/* Premium Gradient: Primary Blue to Lighter Blue */}
            <linearGradient id="techGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00A3FF" />
              <stop offset="100%" stopColor="#7bcfff" />
            </linearGradient>
            
            {/* Glow Filter for that "High-Tech" feel */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track (The faint gray hexagon behind) */}
          <path 
            d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" 
            fill="none" 
            stroke="#E0F2FE" 
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Progress Indicator (The Drawing Line) */}
          <path 
            d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" 
            fill="none" 
            stroke="url(#techGradient)" 
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            className="animate-draw-hex"
          />
        </svg>

        {/* Center Logo/Icon (Static Anchor) */}
        <div className="absolute text-[#00A3FF] font-bold text-3xl tracking-tighter animate-pulse-slow">
            S
        </div>
      </div>

      {/* --- TYPOGRAPHY --- */}
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-[#00A3FF] font-semibold text-base tracking-[0.2em] uppercase">
          Senior
        </h2>
        
        {/* Minimalist Progress Bar */}
        <div className="h-[2px] w-24 bg-[#F0F9FF] overflow-hidden rounded-full">
            <div className="h-full bg-[#00A3FF] w-full origin-left animate-progress-indeterminate"></div>
        </div>
      </div>

      {/* --- CSS ANIMATIONS --- */}
      <style>{`
        /* 1. Hexagon Drawing Animation */
        .animate-draw-hex {
          stroke-dasharray: 270; /* Length of the path */
          stroke-dashoffset: 270;
          animation: draw 2s ease-in-out infinite;
        }

        @keyframes draw {
          0% {
            stroke-dashoffset: 270;
          }
          50% {
            stroke-dashoffset: 0;
            transform: scale(1);
          }
          100% {
            stroke-dashoffset: -270;
          }
        }

        /* 2. Indeterminate Progress Bar (Microsoft/Google style) */
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
        }

        @keyframes progress-indeterminate {
          0% { transform: translateX(-100%) scaleX(0.2); }
          50% { transform: translateX(0%) scaleX(0.5); }
          100% { transform: translateX(100%) scaleX(0.2); }
        }

        /* 3. Subtle Pulse */
        .animate-pulse-slow {
          animation: pulse 3s infinite ease-in-out;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        /* 4. Background Ping */
        .animate-ping-slow {
            animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}