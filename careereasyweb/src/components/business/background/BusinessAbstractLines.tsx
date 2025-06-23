'use client';

export default function BusinessAbstractLines() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 1200 800" 
        className="absolute inset-0 w-full h-full opacity-[0.08]"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Diagonal lines - top left */}
        <g stroke="#A0520D" strokeWidth="2" fill="none">
          <line x1="0" y1="100" x2="300" y2="0" />
          <line x1="0" y1="150" x2="350" y2="0" />
          <line x1="0" y1="200" x2="400" y2="0" />
        </g>
        
        {/* Diagonal lines - top right */}
        <g stroke="#D2691E" strokeWidth="2" fill="none">
          <line x1="900" y1="0" x2="1200" y2="150" />
          <line x1="950" y1="0" x2="1200" y2="100" />
          <line x1="1000" y1="0" x2="1200" y2="50" />
        </g>
        
        {/* Subtle grid pattern */}
        <g stroke="#E2E8F0" strokeWidth="1" fill="none" opacity="0.7">
          {/* Vertical lines */}
          <line x1="200" y1="0" x2="200" y2="800" />
          <line x1="400" y1="0" x2="400" y2="800" />
          <line x1="600" y1="0" x2="600" y2="800" />
          <line x1="800" y1="0" x2="800" y2="800" />
          <line x1="1000" y1="0" x2="1000" y2="800" />
          
          {/* Horizontal lines */}
          <line x1="0" y1="200" x2="1200" y2="200" />
          <line x1="0" y1="400" x2="1200" y2="400" />
          <line x1="0" y1="600" x2="1200" y2="600" />
        </g>
        
        {/* Corner accents */}
        <g stroke="#D2691E" strokeWidth="3" fill="none">
          {/* Top left corner */}
          <path d="M 0 50 L 50 50 L 50 0" />
          <path d="M 0 80 L 80 80 L 80 0" />
          
          {/* Bottom right corner */}
          <path d="M 1150 800 L 1150 750 L 1200 750" />
          <path d="M 1120 800 L 1120 720 L 1200 720" />
        </g>
        
        {/* Curved elements for softness */}
        <g stroke="#A0520D" strokeWidth="2" fill="none">
          <path d="M 100 400 Q 300 350 500 400 T 900 380" />
          <path d="M 200 600 Q 400 550 600 600 T 1000 580" />
        </g>
        
        {/* Dots pattern */}
        <g fill="#CBD5E1" opacity="0.4">
          <circle cx="150" cy="150" r="1" />
          <circle cx="350" cy="250" r="1" />
          <circle cx="550" cy="350" r="1" />
          <circle cx="750" cy="250" r="1" />
          <circle cx="950" cy="150" r="1" />
          <circle cx="1050" cy="450" r="1" />
          <circle cx="250" cy="550" r="1" />
          <circle cx="450" cy="650" r="1" />
          <circle cx="650" cy="550" r="1" />
          <circle cx="850" cy="650" r="1" />
        </g>
        
        {/* Bottom accent lines */}
        <g stroke="#A0520D" strokeWidth="2" fill="none">
          <line x1="0" y1="750" x2="400" y2="800" />
          <line x1="800" y1="800" x2="1200" y2="700" />
        </g>
      </svg>
    </div>
  );
}