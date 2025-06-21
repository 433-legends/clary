import React from 'react';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#clip0_37_11372)">
        <rect x="1.75" y="2.5" width="295" height="295" rx="147.5" fill="url(#paint0_linear_37_11372)" stroke="#9D3900" strokeWidth="5"/>
      </g>
      <defs>
        <linearGradient id="paint0_linear_37_11372" x1="149.25" y1="0" x2="149.25" y2="322.041" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F05700"/>
          <stop offset="0.442308" stopColor="#F05700"/>
          <stop offset="0.740385" stopColor="#FF833C"/>
          <stop offset="1" stopColor="#F3F3F3"/>
        </linearGradient>
        <clipPath id="clip0_37_11372">
          <rect width="300" height="300" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
} 