// components/SportsBanner.tsx
import React from 'react';
import Link from 'next/link';

export default function SportsBanner() {
  return (
    <div className="w-full h-fit py-4 md:py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700  ">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-white"></div>
        <div className="absolute top-10 right-10 w-8 h-8 rounded-full bg-white"></div>
        <div className="absolute bottom-6 left-1/4 w-12 h-12 rounded-full bg-white"></div>
        <div className="absolute top-1/2 right-1/3 w-6 h-6 rounded-full bg-white"></div>
      </div>
      
      {/* Banner content */}
      <div className=" mx-auto px-4 ">
        <Link href="/">
          <div className="text-center cursor-pointer">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              <span className="inline-block transform -rotate-3 text-yellow-300">Sports</span>
              <span className="inline-block ml-1 transform rotate-2 text-white">Wordle</span>
            </h1>
            <p className="text-blue-100 text-sm md:text-base mt-1 font-medium tracking-wide">
              Test your sports knowledge with our daily word game
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}