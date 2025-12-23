"use client";
import { Highlighter } from "./../../../components/ui/highlighter";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div>
    <section className="relative w-full min-h-screen overflow-hidden bg-white">
      <div className="relative z-10 flex flex-col items-center pt-6 md:pt-8 -mt-2 md:-mt-4 px-4">

        {/* ---------- HEADING ---------- */}
        <h1 className="text-4xl md:text-5xl font-semibold text-[#181A1C] text-center">
          Your{" "}
          <Highlighter action="highlight" color="#ADE2FF">
            10× growth
          </Highlighter>{" "}
          starts here
        </h1>

      

        {/* ---------- IMAGE + CARDS WRAPPER ---------- */}
      

      </div>
    </section>
    </div>
  );
}