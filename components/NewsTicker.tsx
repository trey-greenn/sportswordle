// components/NewsTicker.tsx
import React, { useEffect, useState, useRef } from 'react';

const sportsNews = [
  "NFL: Chiefs prepare for AFC showdown",
  "NBA: Lakers win thriller in overtime",
  "MLB: Yankees acquire All-Star pitcher",
  "NHL: Oilers extend winning streak to 7 games",
  "Tennis: Djokovic advances to semifinals",
  "Golf: McIlroy leads by 2 strokes at Masters",
  "Olympics: USA dominates medal count",
  "Soccer: Manchester United scores late winner",
  "F1: Hamilton takes pole position in Monaco"
];

export default function NewsTicker() {
  const tickerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;
    
    let position = 0;
    const speed = 1;
    const maxScrollWidth = ticker.scrollWidth / 2;
    
    const animate = () => {
      position += speed;
      if (position >= maxScrollWidth) {
        position = 0;
      }
      ticker.style.transform = `translateX(-${position}px)`;
      requestAnimationFrame(animate);
    };
    
    const animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, []);

  const newsText = sportsNews.join(' >> ');
  const repeatedNews = `${newsText} >> ${newsText}`;
  
  return (
    <div className="w-full bg-gray-800 text-white py-2 overflow-hidden mb-6">
      <div className="ticker-container relative">
        <div 
          ref={tickerRef}
          className="ticker-content whitespace-nowrap font-medium"
        >
          {repeatedNews}
        </div>
      </div>
    </div>
  );
}