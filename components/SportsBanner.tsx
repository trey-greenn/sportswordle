// components/SportsBanner.tsx
import Image from 'next/image';
import React from 'react';

export default function SportsBanner() {
  return (
    <div className="w-full banner-container">
      <Image 
        src="/sportswordle.png" 
        alt="Sports Wordle Banner"
        width={1920}
        height={100}
        className="w-full banner-image"
        priority
        style={{
          maxHeight: '100px',
          objectFit: 'cover',
          objectPosition: 'center'
        }}
      />
    </div>
  );
}