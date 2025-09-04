export function LoginIllustration() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto max-w-md">
      <g>
        {/* Background circle */}
        <circle cx="200" cy="200" r="180" fill="rgba(255,255,255,0.1)" />
        
        {/* Character */}
        <g transform="translate(150, 100)">
          {/* Body */}
          <rect x="30" y="80" width="40" height="60" rx="5" fill="#FFF" />
          {/* Head */}
          <circle cx="50" cy="50" r="30" fill="#FFF" />
          {/* Arms */}
          <rect x="10" y="90" width="20" height="40" rx="10" fill="#FFF" transform="rotate(-20 20 110)" />
          <rect x="70" y="90" width="20" height="40" rx="10" fill="#FFF" transform="rotate(20 80 110)" />
        </g>
        
        {/* Laptop */}
        <g transform="translate(220, 180)">
          <rect x="0" y="0" width="80" height="50" rx="5" fill="#FFF" />
          <rect x="5" y="5" width="70" height="35" rx="3" fill="rgba(0,0,0,0.1)" />
          <rect x="-10" y="50" width="100" height="5" rx="2" fill="#FFF" />
        </g>
      </g>
    </svg>
  );
}

export function RegisterIllustration() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto max-w-md">
      <g>
        {/* Background circle */}
        <circle cx="200" cy="200" r="180" fill="rgba(255,255,255,0.1)" />
        
        {/* Two characters */}
        <g transform="translate(120, 120)">
          {/* First character */}
          <g>
            <rect x="20" y="60" width="35" height="50" rx="5" fill="#FFF" />
            <circle cx="37" cy="35" r="25" fill="#FFF" />
          </g>
          
          {/* Second character */}
          <g transform="translate(80, 0)">
            <rect x="20" y="60" width="35" height="50" rx="5" fill="#FFF" />
            <circle cx="37" cy="35" r="25" fill="#FFF" />
          </g>
          
          {/* Connection line */}
          <path d="M 55 85 L 100 85" stroke="#FFF" strokeWidth="3" strokeDasharray="5,5" />
        </g>
        
        {/* Form/Document */}
        <g transform="translate(150, 230)">
          <rect x="0" y="0" width="100" height="120" rx="5" fill="#FFF" />
          <rect x="10" y="10" width="80" height="5" rx="2" fill="rgba(0,0,0,0.1)" />
          <rect x="10" y="25" width="60" height="5" rx="2" fill="rgba(0,0,0,0.1)" />
          <rect x="10" y="40" width="70" height="5" rx="2" fill="rgba(0,0,0,0.1)" />
        </g>
      </g>
    </svg>
  );
}

export function ForgotPasswordIllustration() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto max-w-md">
      <g>
        {/* Background circle */}
        <circle cx="200" cy="200" r="180" fill="rgba(255,255,255,0.1)" />
        
        {/* Character thinking */}
        <g transform="translate(130, 100)">
          {/* Body */}
          <rect x="30" y="80" width="40" height="60" rx="5" fill="#FFF" />
          {/* Head */}
          <circle cx="50" cy="50" r="30" fill="#FFF" />
          {/* Question marks */}
          <text x="90" y="30" fontSize="24" fill="#FFF" fontWeight="bold">?</text>
          <text x="110" y="50" fontSize="20" fill="#FFF" opacity="0.7" fontWeight="bold">?</text>
          <text x="95" y="70" fontSize="18" fill="#FFF" opacity="0.5" fontWeight="bold">?</text>
        </g>
        
        {/* Email icon */}
        <g transform="translate(150, 250)">
          <rect x="0" y="0" width="100" height="70" rx="5" fill="#FFF" />
          <path d="M 5 5 L 50 35 L 95 5" stroke="rgba(0,0,0,0.2)" strokeWidth="3" fill="none" />
        </g>
      </g>
    </svg>
  );
}

export function SuccessIllustration() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto max-w-md">
      <g>
        {/* Background circle */}
        <circle cx="200" cy="200" r="180" fill="rgba(255,255,255,0.1)" />
        
        {/* Character celebrating */}
        <g transform="translate(150, 100)">
          {/* Body */}
          <rect x="30" y="80" width="40" height="60" rx="5" fill="#FFF" />
          {/* Head */}
          <circle cx="50" cy="50" r="30" fill="#FFF" />
          {/* Arms raised */}
          <rect x="10" y="70" width="20" height="40" rx="10" fill="#FFF" transform="rotate(-45 20 90)" />
          <rect x="70" y="70" width="20" height="40" rx="10" fill="#FFF" transform="rotate(45 80 90)" />
        </g>
        
        {/* Checkmark circle */}
        <g transform="translate(170, 240)">
          <circle cx="30" cy="30" r="40" fill="#FFF" />
          <path d="M 10 30 L 25 45 L 50 15" stroke="rgba(0,0,0,0.2)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
}

export function VerificationIllustration() {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto max-w-md">
      <g>
        {/* Background circle */}
        <circle cx="200" cy="200" r="180" fill="rgba(255,255,255,0.1)" />
        
        {/* Mobile device */}
        <g transform="translate(160, 100)">
          <rect x="0" y="0" width="80" height="140" rx="10" fill="#FFF" />
          <rect x="5" y="20" width="70" height="100" rx="5" fill="rgba(0,0,0,0.1)" />
          <circle cx="40" cy="130" r="5" fill="rgba(0,0,0,0.2)" />
        </g>
        
        {/* Shield with lock */}
        <g transform="translate(170, 250)">
          <path d="M 30 0 L 60 10 L 60 40 Q 60 60 30 70 Q 0 60 0 40 L 0 10 Z" fill="#FFF" />
          <g transform="translate(20, 20)">
            <rect x="0" y="10" width="20" height="15" rx="2" fill="rgba(0,0,0,0.2)" />
            <path d="M 5 10 Q 5 0 10 0 Q 15 0 15 10" stroke="rgba(0,0,0,0.2)" strokeWidth="3" fill="none" />
          </g>
        </g>
      </g>
    </svg>
  );
}