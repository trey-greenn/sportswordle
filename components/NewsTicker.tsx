// components/NewsTicker.tsx
import React, { useEffect, useState, useRef } from 'react';

const sportsNews = [
  "Nuggets and Clippers head to Game 7 showdown in Denver",
  "Rockets force Game 7 against Warriors with dominant win",
  "Jalen Brunson's clutch 3-pointer sends Knicks to East semis",
  "Celtics and Knicks set to renew playoff rivalry",
  "Thunder sweep Grizzlies to advance to second round",
  "Timberwolves upset Lakers in five games",
  "Pacers eliminate Bucks in thrilling overtime finish",
  "Cavaliers sweep Heat to move on to conference semifinals",
  "Warriors face familiar Game 7 pressure against Rockets"
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

  const newsText = sportsNews.join(' ➡️ ');
  const repeatedNews = `${newsText} ➡️ ${newsText}`;
  
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