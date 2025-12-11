import React, { useState, useEffect } from 'react';

// ============================================
// LOGO COMPONENTS
// ============================================

const NestIcon = ({ size = 48, color = '#2D5A4A', accentColor = '#E8A87C' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M8 32C8 32 12 38 24 38C36 38 40 32 40 32" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    <path d="M12 28C12 28 15 33 24 33C33 33 36 28 36 28" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M16 24.5C16 24.5 18.5 28.5 24 28.5C29.5 28.5 32 24.5 32 24.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M24 8L38 20H10L24 8Z" fill={accentColor}/>
    <path d="M24 8L38 20H10L24 8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="30" y="11" width="4" height="6" fill={color} rx="1"/>
  </svg>
);

const LogoFull = ({ size = 48, color = '#2D5A4A', accentColor = '#E8A87C' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.22 }}>
    <NestIcon size={size} color={color} accentColor={accentColor} />
    <span style={{ 
      fontFamily: "'Fraunces', Georgia, serif",
      fontSize: size * 0.52,
      fontWeight: 500,
      color,
      letterSpacing: '-0.01em',
    }}>
      HomeNest
    </span>
  </div>
);

const LogoStacked = ({ size = 48, color = '#2D5A4A', accentColor = '#E8A87C' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.15 }}>
    <NestIcon size={size} color={color} accentColor={accentColor} />
    <span style={{ 
      fontFamily: "'Fraunces', Georgia, serif",
      fontSize: size * 0.4,
      fontWeight: 500,
      color,
      letterSpacing: '-0.01em',
    }}>
      HomeNest
    </span>
  </div>
);

// ============================================
// GRAPHIC ELEMENTS
// ============================================

const NestCurvesGraphic = ({ width = 400, height = 150, color = '#E8A87C', opacity = 0.15 }) => (
  <svg width={width} height={height} viewBox="0 0 400 150" fill="none">
    <path d="M0 150C0 150 80 80 200 80C320 80 400 150 400 150" stroke={color} strokeWidth="24" strokeLinecap="round" opacity={opacity}/>
    <path d="M40 150C40 150 100 100 200 100C300 100 360 150 360 150" stroke={color} strokeWidth="16" strokeLinecap="round" opacity={opacity * 0.8}/>
    <path d="M80 150C80 150 120 115 200 115C280 115 320 150 320 150" stroke={color} strokeWidth="10" strokeLinecap="round" opacity={opacity * 0.6}/>
  </svg>
);

const NestPatternTile = ({ size = 100, color = '#2D5A4A', opacity = 0.08 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M0 80C0 80 20 60 50 60C80 60 100 80 100 80" stroke={color} strokeWidth="4" strokeLinecap="round" opacity={opacity}/>
    <path d="M10 90C10 90 25 75 50 75C75 75 90 90 90 90" stroke={color} strokeWidth="3" strokeLinecap="round" opacity={opacity * 0.7}/>
  </svg>
);

const CornerNest = ({ size = 120, color = '#E8A87C', position = 'bottom-left' }) => {
  const transforms = {
    'bottom-left': 'rotate(0)',
    'bottom-right': 'scaleX(-1)',
    'top-left': 'scaleY(-1)',
    'top-right': 'scale(-1)',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ transform: transforms[position] }}>
      <path d="M0 120C0 120 30 80 80 80C100 80 120 90 120 90" stroke={color} strokeWidth="6" strokeLinecap="round" opacity="0.3"/>
      <path d="M0 120C0 120 25 95 65 95C85 95 100 100 100 100" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.2"/>
      <path d="M0 120C0 120 20 108 50 108C65 108 80 112 80 112" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.15"/>
    </svg>
  );
};

const DotPattern = ({ width = 200, height = 200, color = '#2D5A4A', opacity = 0.1 }) => (
  <svg width={width} height={height} viewBox="0 0 200 200" fill="none">
    {[...Array(10)].map((_, row) =>
      [...Array(10)].map((_, col) => (
        <circle
          key={`${row}-${col}`}
          cx={10 + col * 20}
          cy={10 + row * 20}
          r="2"
          fill={color}
          opacity={opacity}
        />
      ))
    )}
  </svg>
);

const WaveDivider = ({ width = 800, color = '#F5EDE4' }) => (
  <svg width={width} height="60" viewBox="0 0 800 60" fill="none" preserveAspectRatio="none">
    <path d="M0 30C133 60 267 0 400 30C533 60 667 0 800 30V60H0V30Z" fill={color}/>
  </svg>
);

// Radial Nest Pattern
const RadialNest = ({ size = 200, color = '#E8A87C', opacity = 0.15 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
    <circle cx="100" cy="100" r="90" stroke={color} strokeWidth="4" opacity={opacity} fill="none"/>
    <circle cx="100" cy="100" r="70" stroke={color} strokeWidth="3" opacity={opacity * 0.8} fill="none"/>
    <circle cx="100" cy="100" r="50" stroke={color} strokeWidth="2.5" opacity={opacity * 0.6} fill="none"/>
    <circle cx="100" cy="100" r="32" stroke={color} strokeWidth="2" opacity={opacity * 0.4} fill="none"/>
  </svg>
);

// Twig Accent
const TwigAccent = ({ width = 120, color = '#2D5A4A', opacity = 0.2 }) => (
  <svg width={width} height={width * 0.5} viewBox="0 0 120 60" fill="none">
    <path d="M10 50C30 50 40 30 60 30C80 30 90 50 110 50" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={opacity}/>
    <path d="M40 30C40 30 35 20 45 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity * 0.8}/>
    <path d="M60 30C60 30 60 18 70 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity * 0.8}/>
    <path d="M80 35C80 35 85 25 78 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity * 0.8}/>
  </svg>
);

// Leaf Shape
const LeafShape = ({ size = 60, color = '#2D5A4A', opacity = 0.15, rotation = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={{ transform: `rotate(${rotation}deg)` }}>
    <path d="M30 5C30 5 50 20 50 40C50 50 40 55 30 55C20 55 10 50 10 40C10 20 30 5 30 5Z" fill={color} opacity={opacity}/>
    <path d="M30 15V45" stroke={color} strokeWidth="1" opacity={opacity * 1.5}/>
    <path d="M30 25L22 32" stroke={color} strokeWidth="0.75" opacity={opacity * 1.5}/>
    <path d="M30 32L38 38" stroke={color} strokeWidth="0.75" opacity={opacity * 1.5}/>
  </svg>
);

// Abstract House Shape
const AbstractHouse = ({ size = 80, color = '#2D5A4A', accentColor = '#E8A87C', opacity = 0.2 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <path d="M40 10L70 35V70H10V35L40 10Z" stroke={color} strokeWidth="2" opacity={opacity} fill="none"/>
    <path d="M40 10L70 35H10L40 10Z" fill={accentColor} opacity={opacity * 0.8}/>
    <rect x="32" y="45" width="16" height="25" stroke={color} strokeWidth="1.5" opacity={opacity} fill="none"/>
  </svg>
);

// Confetti/Celebration
const ConfettiGraphic = ({ size = 150, animated = false }) => (
  <svg width={size} height={size} viewBox="0 0 150 150" fill="none">
    <rect x="30" y="40" width="8" height="8" fill="#E8A87C" opacity="0.6" transform="rotate(15 34 44)" style={animated ? { animation: 'confettiFall 2s ease-in-out infinite' } : {}}>
      {animated && <animateTransform attributeName="transform" type="translate" values="0,0; 0,20; 0,0" dur="2s" repeatCount="indefinite"/>}
    </rect>
    <rect x="60" y="25" width="6" height="6" fill="#2D5A4A" opacity="0.5" transform="rotate(-20 63 28)" style={animated ? { animation: 'confettiFall 2.3s ease-in-out infinite', animationDelay: '0.2s' } : {}}/>
    <rect x="100" y="35" width="10" height="10" fill="#E8A87C" opacity="0.4" transform="rotate(45 105 40)" style={animated ? { animation: 'confettiFall 1.8s ease-in-out infinite', animationDelay: '0.5s' } : {}}/>
    <circle cx="45" cy="60" r="4" fill="#2D5A4A" opacity="0.5" style={animated ? { animation: 'confettiFall 2.1s ease-in-out infinite', animationDelay: '0.3s' } : {}}/>
    <circle cx="110" cy="55" r="5" fill="#E8A87C" opacity="0.6" style={animated ? { animation: 'confettiFall 2.5s ease-in-out infinite', animationDelay: '0.1s' } : {}}/>
    <rect x="80" y="50" width="7" height="7" fill="#2D5A4A" opacity="0.4" transform="rotate(30 83 53)" style={animated ? { animation: 'confettiFall 2.2s ease-in-out infinite', animationDelay: '0.4s' } : {}}/>
    <circle cx="70" cy="70" r="3" fill="#E8A87C" opacity="0.5" style={animated ? { animation: 'confettiFall 1.9s ease-in-out infinite', animationDelay: '0.6s' } : {}}/>
    <rect x="95" y="75" width="5" height="5" fill="#2D5A4A" opacity="0.6" transform="rotate(-15 97 77)" style={animated ? { animation: 'confettiFall 2.4s ease-in-out infinite', animationDelay: '0.2s' } : {}}/>
  </svg>
);

// Progress Arc
const ProgressArc = ({ size = 120, progress = 0.68, color = '#2D5A4A', trackColor = '#E5E5E5' }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress * circumference);
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r={radius} stroke={trackColor} strokeWidth="8" fill="none"/>
      <circle 
        cx="60" 
        cy="60" 
        r={radius} 
        stroke={color} 
        strokeWidth="8" 
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
      />
    </svg>
  );
};

// Badge/Seal
const BadgeSeal = ({ size = 100, color = '#2D5A4A', accentColor = '#E8A87C' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="40" fill={accentColor} opacity="0.15"/>
    <circle cx="50" cy="50" r="35" stroke={color} strokeWidth="2" fill="none" opacity="0.3"/>
    <circle cx="50" cy="50" r="28" stroke={color} strokeWidth="1" fill="none" opacity="0.2"/>
    <path d="M50 25L53 40L68 40L56 49L60 64L50 55L40 64L44 49L32 40L47 40L50 25Z" fill={color} opacity="0.25"/>
  </svg>
);

// Layered Waves
const LayeredWaves = ({ width = 400, height = 120, color = '#E8A87C' }) => (
  <svg width={width} height={height} viewBox="0 0 400 120" fill="none" preserveAspectRatio="none">
    <path d="M0 80C100 100 150 60 200 70C250 80 300 100 400 80V120H0V80Z" fill={color} opacity="0.1"/>
    <path d="M0 90C80 70 160 100 240 85C320 70 360 90 400 85V120H0V90Z" fill={color} opacity="0.15"/>
    <path d="M0 100C60 95 120 105 200 100C280 95 340 105 400 100V120H0V100Z" fill={color} opacity="0.2"/>
  </svg>
);

// Floating Shapes Background
const FloatingShapes = ({ width = 300, height = 200, color = '#2D5A4A', animated = false }) => (
  <svg width={width} height={height} viewBox="0 0 300 200" fill="none">
    <circle cx="50" cy="40" r="20" fill={color} opacity="0.06" style={animated ? { animation: 'float 4s ease-in-out infinite' } : {}}/>
    <circle cx="250" cy="60" r="15" fill={color} opacity="0.08" style={animated ? { animation: 'float 5s ease-in-out infinite', animationDelay: '1s' } : {}}/>
    <circle cx="150" cy="150" r="25" fill={color} opacity="0.05" style={animated ? { animation: 'float 4.5s ease-in-out infinite', animationDelay: '0.5s' } : {}}/>
    <circle cx="80" cy="160" r="12" fill={color} opacity="0.07" style={animated ? { animation: 'float 3.5s ease-in-out infinite', animationDelay: '1.5s' } : {}}/>
    <circle cx="220" cy="140" r="18" fill={color} opacity="0.04" style={animated ? { animation: 'float 5.5s ease-in-out infinite', animationDelay: '2s' } : {}}/>
  </svg>
);

// Diagonal Lines Pattern
const DiagonalLines = ({ width = 200, height = 200, color = '#2D5A4A', opacity = 0.08 }) => (
  <svg width={width} height={height} viewBox="0 0 200 200" fill="none">
    {[...Array(15)].map((_, i) => (
      <line
        key={i}
        x1={i * 20 - 100}
        y1="0"
        x2={i * 20 + 100}
        y2="200"
        stroke={color}
        strokeWidth="1"
        opacity={opacity}
      />
    ))}
  </svg>
);

// Scallop Border
const ScallopBorder = ({ width = 400, color = '#E8A87C', opacity = 0.2 }) => (
  <svg width={width} height="20" viewBox="0 0 400 20" fill="none" preserveAspectRatio="none">
    {[...Array(20)].map((_, i) => (
      <circle
        key={i}
        cx={10 + i * 20}
        cy="10"
        r="10"
        fill={color}
        opacity={opacity}
      />
    ))}
  </svg>
);

// ============================================
// UI COMPONENTS
// ============================================

const Button = ({ children, variant = 'primary', size = 'md' }) => {
  const styles = {
    primary: { bg: '#2D5A4A', color: 'white', border: 'none' },
    secondary: { bg: 'white', color: '#2D5A4A', border: '2px solid #2D5A4A' },
    accent: { bg: '#E8A87C', color: 'white', border: 'none' },
    ghost: { bg: 'transparent', color: '#2D5A4A', border: 'none' },
  };
  const sizes = {
    sm: { padding: '8px 16px', fontSize: '13px' },
    md: { padding: '12px 24px', fontSize: '15px' },
    lg: { padding: '16px 32px', fontSize: '17px' },
  };
  const s = styles[variant];
  const sz = sizes[size];
  
  return (
    <button style={{
      backgroundColor: s.bg,
      color: s.color,
      border: s.border,
      padding: sz.padding,
      fontSize: sz.fontSize,
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 600,
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }}>
      {children}
    </button>
  );
};

const InputField = ({ placeholder, label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {label && <label style={{ fontSize: '13px', fontWeight: 500, color: '#2A2A2A', fontFamily: "'Outfit', sans-serif" }}>{label}</label>}
    <input 
      placeholder={placeholder}
      style={{
        padding: '12px 16px',
        fontSize: '15px',
        fontFamily: "'Outfit', sans-serif",
        border: '2px solid #E5E5E5',
        borderRadius: '8px',
        outline: 'none',
        transition: 'border-color 0.2s ease',
      }}
    />
  </div>
);

const Card = ({ children, padding = 24 }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '16px',
    padding,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  }}>
    {children}
  </div>
);

// ============================================
// ANIMATED SPLASH SCREEN DEMO
// ============================================

const AnimatedSplash = ({ playing }) => {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    if (playing) {
      setStep(0);
      const timers = [
        setTimeout(() => setStep(1), 200),
        setTimeout(() => setStep(2), 500),
        setTimeout(() => setStep(3), 800),
        setTimeout(() => setStep(4), 1100),
        setTimeout(() => setStep(5), 1400),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [playing]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Nest curves animation */}
      <svg width="200" height="80" viewBox="0 0 200 80" fill="none" style={{ position: 'absolute', bottom: '25%' }}>
        <path 
          d="M20 60C20 60 50 80 100 80C150 80 180 60 180 60" 
          stroke="#E8A87C" 
          strokeWidth="6" 
          strokeLinecap="round"
          style={{
            opacity: step >= 1 ? 0.3 : 0,
            transition: 'opacity 0.4s ease-out',
          }}
        />
        <path 
          d="M40 50C40 50 60 70 100 70C140 70 160 50 160 50" 
          stroke="#E8A87C" 
          strokeWidth="5" 
          strokeLinecap="round"
          style={{
            opacity: step >= 2 ? 0.25 : 0,
            transition: 'opacity 0.4s ease-out',
          }}
        />
        <path 
          d="M60 42C60 42 75 58 100 58C125 58 140 42 140 42" 
          stroke="#E8A87C" 
          strokeWidth="4" 
          strokeLinecap="round"
          style={{
            opacity: step >= 3 ? 0.2 : 0,
            transition: 'opacity 0.4s ease-out',
          }}
        />
      </svg>
      
      {/* Icon */}
      <div style={{
        opacity: step >= 3 ? 1 : 0,
        transform: step >= 3 ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <NestIcon size={80} color="#2D5A4A" accentColor="#E8A87C" />
      </div>
      
      {/* Text */}
      <span style={{
        fontFamily: "'Fraunces', Georgia, serif",
        fontSize: '32px',
        fontWeight: 500,
        color: '#2D5A4A',
        marginTop: '16px',
        opacity: step >= 4 ? 1 : 0,
        transform: step >= 4 ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.4s ease-out',
      }}>
        HomeNest
      </span>
      
      {/* Tagline */}
      <span style={{
        fontSize: '14px',
        color: '#999999',
        marginTop: '8px',
        opacity: step >= 5 ? 1 : 0,
        transition: 'opacity 0.4s ease-out',
      }}>
        Your renovation, organized
      </span>
    </div>
  );
};

// ============================================
// MAIN BRANDBOOK
// ============================================

export default function HomeNestBrandbook() {
  const [activeSection, setActiveSection] = useState('overview');
  const [splashPlaying, setSplashPlaying] = useState(false);
  
  const palette = {
    forest: '#2D5A4A',
    forestDark: '#1E3D32',
    forestLight: '#3D7A64',
    terracotta: '#E8A87C',
    terracottaDark: '#D4896A',
    terracottaLight: '#F2C4A8',
    cream: '#F5EDE4',
    warmWhite: '#FDFBF8',
    charcoal: '#2A2A2A',
    gray600: '#666666',
    gray400: '#999999',
    gray200: '#E5E5E5',
    gray100: '#F5F5F5',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#E53935',
    info: '#2196F3',
  };

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'logo', label: 'Logo' },
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'graphics', label: 'Graphics' },
    { id: 'animation', label: 'Animation' },
    { id: 'components', label: 'Components' },
    { id: 'mobile', label: 'Mobile App' },
    { id: 'donts', label: "Do's & Don'ts" },
  ];

  // CSS Keyframes
  const keyframes = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInScale {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    @keyframes drawLine {
      from { stroke-dashoffset: 200; }
      to { stroke-dashoffset: 0; }
    }
    @keyframes bounceIn {
      0% { opacity: 0; transform: scale(0.3); }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes floatSlow {
      0%, 100% { transform: translateY(0) translateX(0); }
      25% { transform: translateY(-8px) translateX(4px); }
      50% { transform: translateY(-4px) translateX(8px); }
      75% { transform: translateY(-12px) translateX(4px); }
    }
    @keyframes breathe {
      0%, 100% { transform: scale(1); opacity: 0.15; }
      50% { transform: scale(1.05); opacity: 0.25; }
    }
    @keyframes flowRight {
      0% { transform: translateX(-20px); opacity: 0; }
      20% { opacity: 1; }
      80% { opacity: 1; }
      100% { transform: translateX(20px); opacity: 0; }
    }
    @keyframes wave {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-5px) rotate(2deg); }
      75% { transform: translateY(5px) rotate(-2deg); }
    }
    @keyframes gentleSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes nestDraw {
      0% { stroke-dashoffset: 300; opacity: 0; }
      10% { opacity: 1; }
      100% { stroke-dashoffset: 0; opacity: 1; }
    }
    @keyframes confettiFall {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(15px) rotate(180deg); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes ripple {
      0% { transform: scale(0.8); opacity: 0.5; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    @keyframes sway {
      0%, 100% { transform: rotate(-3deg); }
      50% { transform: rotate(3deg); }
    }
  `;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: palette.gray100,
      fontFamily: "'Outfit', -apple-system, sans-serif",
    }}>
      <style>{keyframes}</style>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&display=swap" rel="stylesheet" />
      
      {/* Fixed Sidebar */}
      <nav style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '240px',
        backgroundColor: palette.forest,
        padding: '32px 0',
        overflowY: 'auto',
        zIndex: 100,
      }}>
        <div style={{ padding: '0 24px', marginBottom: '40px' }}>
          <LogoFull size={36} color="white" accentColor={palette.terracotta} />
        </div>
        
        <div style={{ padding: '0 16px' }}>
          <p style={{ 
            fontSize: '10px', 
            fontWeight: 600, 
            color: 'rgba(255,255,255,0.4)', 
            letterSpacing: '0.1em',
            marginBottom: '12px',
            padding: '0 8px',
          }}>
            BRAND GUIDELINES
          </p>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 12px',
                marginBottom: '4px',
                backgroundColor: activeSection === section.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeSection === section.id ? 'white' : 'rgba(255,255,255,0.7)',
                fontSize: '14px',
                fontWeight: activeSection === section.id ? 600 : 400,
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.15s ease',
              }}
            >
              {section.label}
            </button>
          ))}
        </div>
        
        <div style={{ 
          position: 'absolute', 
          bottom: '24px', 
          left: '24px', 
          right: '24px',
        }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
            Version 1.0<br/>
            December 2024
          </p>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ marginLeft: '240px', padding: '48px' }}>
        <div style={{ maxWidth: '1000px' }}>
          
          {/* OVERVIEW SECTION */}
          {activeSection === 'overview' && (
            <div>
              <h1 style={{ 
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: '48px', 
                fontWeight: 500, 
                color: palette.charcoal,
                marginBottom: '16px',
              }}>
                HomeNest Brand Guidelines
              </h1>
              <p style={{ fontSize: '18px', color: palette.gray600, marginBottom: '48px', maxWidth: '600px', lineHeight: 1.6 }}>
                A comprehensive guide to the HomeNest brand identity for web and mobile applications.
              </p>

              {/* Brand Essence */}
              <Card padding={40}>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: palette.charcoal, marginBottom: '24px' }}>
                  Brand Essence
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: palette.forest, marginBottom: '8px' }}>Mission</h3>
                    <p style={{ fontSize: '15px', color: palette.gray600, lineHeight: 1.6 }}>
                      To bring order and peace of mind to home renovations, helping homeowners stay on budget, on time, and in control.
                    </p>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: palette.forest, marginBottom: '8px' }}>Vision</h3>
                    <p style={{ fontSize: '15px', color: palette.gray600, lineHeight: 1.6 }}>
                      Every homeowner deserves the tools to transform their space without stress or financial surprises.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Brand Attributes */}
              <div style={{ marginTop: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginBottom: '20px' }}>
                  Brand Attributes
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  {[
                    { title: 'Trustworthy', desc: 'Reliable partner through the renovation journey' },
                    { title: 'Organized', desc: 'Bringing order to complexity' },
                    { title: 'Warm', desc: 'Approachable and human' },
                    { title: 'Simple', desc: 'Easy to understand and use' },
                  ].map((attr, i) => (
                    <Card key={i} padding={24}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: palette.cream,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: '18px',
                        color: palette.forest,
                        fontWeight: 500,
                      }}>
                        {i + 1}
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: palette.charcoal, marginBottom: '6px' }}>{attr.title}</h3>
                      <p style={{ fontSize: '13px', color: palette.gray600, lineHeight: 1.5 }}>{attr.desc}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Voice & Tone */}
              <Card padding={40} style={{ marginTop: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: palette.charcoal, marginBottom: '24px' }}>
                  Voice & Tone
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: palette.forest, marginBottom: '12px' }}>We Are</h3>
                    <ul style={{ fontSize: '14px', color: palette.gray600, lineHeight: 1.8, paddingLeft: '16px' }}>
                      <li>Friendly and supportive</li>
                      <li>Clear and helpful</li>
                      <li>Encouraging</li>
                      <li>Expert but approachable</li>
                    </ul>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: palette.forest, marginBottom: '12px' }}>We Avoid</h3>
                    <ul style={{ fontSize: '14px', color: palette.gray600, lineHeight: 1.8, paddingLeft: '16px' }}>
                      <li>Technical jargon</li>
                      <li>Condescending language</li>
                      <li>Cold or corporate tone</li>
                      <li>Overwhelming information</li>
                    </ul>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: palette.forest, marginBottom: '12px' }}>Example Copy</h3>
                    <p style={{ fontSize: '14px', color: palette.gray600, lineHeight: 1.6, fontStyle: 'italic' }}>
                      "Looking good! You're $2,100 under budget. Keep it up!"
                    </p>
                    <p style={{ fontSize: '14px', color: palette.gray600, lineHeight: 1.6, fontStyle: 'italic', marginTop: '8px' }}>
                      "Let's get your project organized in just 2 minutes."
                    </p>
                  </div>
                </div>
              </Card>

              {/* No Emojis Rule */}
              <Card padding={32} style={{ marginTop: '32px', border: `2px solid ${palette.error}` }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#FFEBEE',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={palette.error} strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: palette.charcoal, marginBottom: '8px' }}>
                      No Emojis
                    </h3>
                    <p style={{ fontSize: '14px', color: palette.gray600, lineHeight: 1.6 }}>
                      HomeNest does not use emojis in any communication, UI text, marketing materials, or documentation. 
                      Our brand voice is warm and friendly through language, not symbols. Use clear, thoughtful copy to convey emotion and tone instead.
                    </p>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '24px' }}>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: palette.error, marginBottom: '4px' }}>Don't</p>
                        <p style={{ fontSize: '14px', color: palette.gray600 }}>"Great job! 🎉"</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: palette.success, marginBottom: '4px' }}>Do</p>
                        <p style={{ fontSize: '14px', color: palette.gray600 }}>"Great job! You're on track."</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* LOGO SECTION */}
          {activeSection === 'logo' && (
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 600, color: palette.charcoal, marginBottom: '8px' }}>
                Logo
              </h1>
              <p style={{ fontSize: '16px', color: palette.gray600, marginBottom: '40px' }}>
                The HomeNest logo combines a house roof with organic nest curves, symbolizing safety, organization, and home.
              </p>

              {/* Primary Logo */}
              <Card padding={48}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '24px' }}>
                  PRIMARY LOGO
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', backgroundColor: palette.warmWhite, borderRadius: '12px' }}>
                  <LogoFull size={72} />
                </div>
                <p style={{ fontSize: '13px', color: palette.gray600, marginTop: '20px', textAlign: 'center' }}>
                  Use the primary horizontal logo whenever possible. This is the preferred format.
                </p>
              </Card>

              {/* Logo Variations */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Logo Variations
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <Card padding={32}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '20px' }}>
                    HORIZONTAL
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '24px', backgroundColor: palette.warmWhite, borderRadius: '8px' }}>
                    <LogoFull size={48} />
                  </div>
                  <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '12px' }}>Website header, app header</p>
                </Card>
                
                <Card padding={32}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '20px' }}>
                    STACKED
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '24px', backgroundColor: palette.warmWhite, borderRadius: '8px' }}>
                    <LogoStacked size={48} />
                  </div>
                  <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '12px' }}>Social media, square formats</p>
                </Card>
                
                <Card padding={32}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '20px' }}>
                    ICON ONLY
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '24px', backgroundColor: palette.warmWhite, borderRadius: '8px' }}>
                    <NestIcon size={48} />
                  </div>
                  <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '12px' }}>App icon, favicon, small spaces</p>
                </Card>
              </div>

              {/* Color Variations */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Color Variations
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <Card padding={0}>
                  <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'center' }}>
                    <LogoFull size={56} />
                  </div>
                  <div style={{ padding: '16px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: palette.charcoal }}>Full Color on Light</p>
                    <p style={{ fontSize: '12px', color: palette.gray600 }}>Primary usage</p>
                  </div>
                </Card>
                
                <Card padding={0}>
                  <div style={{ padding: '40px', backgroundColor: palette.forest, borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'center' }}>
                    <LogoFull size={56} color="white" accentColor={palette.terracotta} />
                  </div>
                  <div style={{ padding: '16px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: palette.charcoal }}>White on Dark</p>
                    <p style={{ fontSize: '12px', color: palette.gray600 }}>Dark backgrounds</p>
                  </div>
                </Card>
                
                <Card padding={0}>
                  <div style={{ padding: '40px', backgroundColor: palette.charcoal, borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'center' }}>
                    <LogoFull size={56} color="white" accentColor="rgba(255,255,255,0.4)" />
                  </div>
                  <div style={{ padding: '16px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: palette.charcoal }}>Monochrome White</p>
                    <p style={{ fontSize: '12px', color: palette.gray600 }}>When color isn't available</p>
                  </div>
                </Card>
                
                <Card padding={0}>
                  <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'center' }}>
                    <LogoFull size={56} color={palette.charcoal} accentColor={palette.gray400} />
                  </div>
                  <div style={{ padding: '16px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: palette.charcoal }}>Monochrome Dark</p>
                    <p style={{ fontSize: '12px', color: palette.gray600 }}>Print, grayscale contexts</p>
                  </div>
                </Card>
              </div>

              {/* Clear Space */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Clear Space & Minimum Size
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <Card padding={32}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '20px' }}>
                    CLEAR SPACE
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    padding: '32px',
                    backgroundColor: palette.warmWhite, 
                    borderRadius: '8px',
                    position: 'relative',
                  }}>
                    <div style={{
                      border: `2px dashed ${palette.terracotta}`,
                      padding: '24px',
                      borderRadius: '4px',
                    }}>
                      <LogoFull size={48} />
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: palette.gray600, marginTop: '16px' }}>
                    Maintain clear space equal to the height of the icon "H" around all sides of the logo.
                  </p>
                </Card>
                
                <Card padding={32}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '20px' }}>
                    MINIMUM SIZE
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '32px',
                    padding: '32px',
                    backgroundColor: palette.warmWhite, 
                    borderRadius: '8px',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <LogoFull size={32} />
                      <p style={{ fontSize: '11px', color: palette.gray600, marginTop: '8px' }}>120px wide</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <NestIcon size={24} />
                      <p style={{ fontSize: '11px', color: palette.gray600, marginTop: '8px' }}>24px icon</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: palette.gray600, marginTop: '16px' }}>
                    Don't use the full logo smaller than 120px. Use icon only for smaller sizes.
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* COLORS SECTION */}
          {activeSection === 'colors' && (
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 600, color: palette.charcoal, marginBottom: '8px' }}>
                Color Palette
              </h1>
              <p style={{ fontSize: '16px', color: palette.gray600, marginBottom: '40px' }}>
                Our colors evoke trust, warmth, and the comfort of home.
              </p>

              {/* Primary Colors */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginBottom: '20px' }}>
                Primary Colors
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '48px' }}>
                <Card padding={0}>
                  <div style={{ height: '160px', backgroundColor: palette.forest, borderRadius: '16px 16px 0 0' }}/>
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: palette.charcoal }}>Forest Green</h3>
                    <p style={{ fontSize: '13px', color: palette.gray600, marginTop: '4px', marginBottom: '16px' }}>Primary brand color. Use for key actions, headers, and emphasis.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px' }}>
                      <div><span style={{ color: palette.gray400 }}>HEX</span><br/><code>#2D5A4A</code></div>
                      <div><span style={{ color: palette.gray400 }}>RGB</span><br/><code>45, 90, 74</code></div>
                      <div><span style={{ color: palette.gray400 }}>HSL</span><br/><code>159, 33%, 26%</code></div>
                    </div>
                  </div>
                </Card>
                
                <Card padding={0}>
                  <div style={{ height: '160px', backgroundColor: palette.terracotta, borderRadius: '16px 16px 0 0' }}/>
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: palette.charcoal }}>Terracotta</h3>
                    <p style={{ fontSize: '13px', color: palette.gray600, marginTop: '4px', marginBottom: '16px' }}>Accent color. Use for highlights, progress indicators, and warmth.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px' }}>
                      <div><span style={{ color: palette.gray400 }}>HEX</span><br/><code>#E8A87C</code></div>
                      <div><span style={{ color: palette.gray400 }}>RGB</span><br/><code>232, 168, 124</code></div>
                      <div><span style={{ color: palette.gray400 }}>HSL</span><br/><code>24, 68%, 70%</code></div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Extended Palette */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginBottom: '20px' }}>
                Extended Palette
              </h2>
              <Card padding={32}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                  {[
                    { name: 'Forest Dark', hex: '#1E3D32', usage: 'Hover states' },
                    { name: 'Forest', hex: '#2D5A4A', usage: 'Primary' },
                    { name: 'Forest Light', hex: '#3D7A64', usage: 'Secondary' },
                    { name: 'Sage', hex: '#8BA888', usage: 'Success tint' },
                    { name: 'Mint', hex: '#E8F5E9', usage: 'Success bg' },
                  ].map((c, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ height: '64px', backgroundColor: c.hex, borderRadius: '8px', marginBottom: '8px' }}/>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: palette.charcoal }}>{c.name}</p>
                      <p style={{ fontSize: '11px', color: palette.gray400 }}>{c.hex}</p>
                      <p style={{ fontSize: '10px', color: palette.gray600, marginTop: '4px' }}>{c.usage}</p>
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginTop: '24px' }}>
                  {[
                    { name: 'Terracotta Dark', hex: '#D4896A', usage: 'Hover states' },
                    { name: 'Terracotta', hex: '#E8A87C', usage: 'Accent' },
                    { name: 'Terracotta Light', hex: '#F2C4A8', usage: 'Highlight' },
                    { name: 'Cream', hex: '#F5EDE4', usage: 'Card bg' },
                    { name: 'Warm White', hex: '#FDFBF8', usage: 'Page bg' },
                  ].map((c, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ height: '64px', backgroundColor: c.hex, borderRadius: '8px', marginBottom: '8px', border: c.hex === '#FDFBF8' ? '1px solid #E5E5E5' : 'none' }}/>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: palette.charcoal }}>{c.name}</p>
                      <p style={{ fontSize: '11px', color: palette.gray400 }}>{c.hex}</p>
                      <p style={{ fontSize: '10px', color: palette.gray600, marginTop: '4px' }}>{c.usage}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Neutrals */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Neutrals
              </h2>
              <Card padding={32}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
                  {[
                    { name: 'Charcoal', hex: '#2A2A2A', usage: 'Headings' },
                    { name: 'Gray 600', hex: '#666666', usage: 'Body text' },
                    { name: 'Gray 400', hex: '#999999', usage: 'Secondary text' },
                    { name: 'Gray 200', hex: '#E5E5E5', usage: 'Borders' },
                    { name: 'Gray 100', hex: '#F5F5F5', usage: 'Backgrounds' },
                    { name: 'White', hex: '#FFFFFF', usage: 'Cards' },
                  ].map((c, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ height: '48px', backgroundColor: c.hex, borderRadius: '8px', marginBottom: '8px', border: c.hex === '#FFFFFF' || c.hex === '#F5F5F5' ? '1px solid #E5E5E5' : 'none' }}/>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: palette.charcoal }}>{c.name}</p>
                      <p style={{ fontSize: '10px', color: palette.gray400 }}>{c.hex}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Semantic Colors */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Semantic Colors
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { name: 'Success', hex: '#4CAF50', bg: '#E8F5E9', usage: 'On track, complete' },
                  { name: 'Warning', hex: '#FF9800', bg: '#FFF3E0', usage: 'Attention needed' },
                  { name: 'Error', hex: '#E53935', bg: '#FFEBEE', usage: 'Over budget, issues' },
                  { name: 'Info', hex: '#2196F3', bg: '#E3F2FD', usage: 'Tips, information' },
                ].map((c, i) => (
                  <Card key={i} padding={20}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: c.hex, borderRadius: '8px' }}/>
                      <div style={{ width: '40px', height: '40px', backgroundColor: c.bg, borderRadius: '8px' }}/>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: palette.charcoal }}>{c.name}</p>
                    <p style={{ fontSize: '11px', color: palette.gray400 }}>{c.hex} / {c.bg}</p>
                    <p style={{ fontSize: '11px', color: palette.gray600, marginTop: '4px' }}>{c.usage}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TYPOGRAPHY SECTION */}
          {activeSection === 'typography' && (
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 600, color: palette.charcoal, marginBottom: '8px' }}>
                Typography
              </h1>
              <p style={{ fontSize: '16px', color: palette.gray600, marginBottom: '40px' }}>
                Our type system pairs warm serif headlines with clean, readable body text.
              </p>

              {/* Font Families */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
                <Card padding={40}>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '4px 12px', 
                    backgroundColor: palette.forest, 
                    color: 'white', 
                    borderRadius: '6px', 
                    fontSize: '11px', 
                    fontWeight: 600,
                    marginBottom: '24px',
                  }}>
                    DISPLAY
                  </span>
                  <h2 style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: '48px',
                    fontWeight: 500,
                    color: palette.charcoal,
                    marginBottom: '16px',
                  }}>
                    Fraunces
                  </h2>
                  <p style={{ fontSize: '14px', color: palette.gray600, marginBottom: '24px' }}>
                    A soft, friendly serif with warmth and character. Use for headlines, logo, and display text.
                  </p>
                  <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '20px', color: palette.forest }}>
                    Aa Bb Cc Dd Ee Ff Gg Hh
                  </div>
                  <p style={{ fontSize: '12px', color: palette.gray400, marginTop: '16px' }}>
                    Weights: 300, 400, 500, 600, 700
                  </p>
                </Card>

                <Card padding={40}>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '4px 12px', 
                    backgroundColor: palette.terracotta, 
                    color: 'white', 
                    borderRadius: '6px', 
                    fontSize: '11px', 
                    fontWeight: 600,
                    marginBottom: '24px',
                  }}>
                    BODY
                  </span>
                  <h2 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '48px',
                    fontWeight: 500,
                    color: palette.charcoal,
                    marginBottom: '16px',
                  }}>
                    Outfit
                  </h2>
                  <p style={{ fontSize: '14px', color: palette.gray600, marginBottom: '24px' }}>
                    A geometric sans-serif that's friendly and highly readable. Use for body text, UI, and labels.
                  </p>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', color: palette.forest }}>
                    Aa Bb Cc Dd Ee Ff Gg Hh
                  </div>
                  <p style={{ fontSize: '12px', color: palette.gray400, marginTop: '16px' }}>
                    Weights: 300, 400, 500, 600, 700
                  </p>
                </Card>
              </div>

              {/* Type Scale */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginBottom: '20px' }}>
                Type Scale
              </h2>
              <Card padding={40}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {[
                    { name: 'Display', size: '48px', weight: 500, font: 'Fraunces', lineHeight: 1.1 },
                    { name: 'H1', size: '36px', weight: 500, font: 'Fraunces', lineHeight: 1.2 },
                    { name: 'H2', size: '28px', weight: 500, font: 'Fraunces', lineHeight: 1.2 },
                    { name: 'H3', size: '22px', weight: 600, font: 'Outfit', lineHeight: 1.3 },
                    { name: 'H4', size: '18px', weight: 600, font: 'Outfit', lineHeight: 1.4 },
                    { name: 'Body Large', size: '18px', weight: 400, font: 'Outfit', lineHeight: 1.6 },
                    { name: 'Body', size: '16px', weight: 400, font: 'Outfit', lineHeight: 1.6 },
                    { name: 'Body Small', size: '14px', weight: 400, font: 'Outfit', lineHeight: 1.5 },
                    { name: 'Caption', size: '12px', weight: 500, font: 'Outfit', lineHeight: 1.4 },
                    { name: 'Overline', size: '11px', weight: 600, font: 'Outfit', lineHeight: 1.4, extra: 'uppercase, tracking 0.1em' },
                  ].map((type, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'baseline', borderBottom: i < 9 ? `1px solid ${palette.gray200}` : 'none', paddingBottom: '16px' }}>
                      <div style={{ width: '120px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: palette.forest }}>{type.name}</p>
                        <p style={{ fontSize: '11px', color: palette.gray400 }}>{type.size} / {type.weight}</p>
                      </div>
                      <p style={{ 
                        fontFamily: type.font === 'Fraunces' ? "'Fraunces', Georgia, serif" : "'Outfit', sans-serif",
                        fontSize: type.size,
                        fontWeight: type.weight,
                        lineHeight: type.lineHeight,
                        color: palette.charcoal,
                        textTransform: type.extra?.includes('uppercase') ? 'uppercase' : 'none',
                        letterSpacing: type.extra?.includes('tracking') ? '0.1em' : 'normal',
                      }}>
                        Your renovation, organized
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* SPACING SECTION */}
          {activeSection === 'spacing' && (
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 600, color: palette.charcoal, marginBottom: '8px' }}>
                Spacing & Layout
              </h1>
              <p style={{ fontSize: '16px', color: palette.gray600, marginBottom: '40px' }}>
                Consistent spacing creates visual harmony and improves readability.
              </p>

              {/* Spacing Scale */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginBottom: '20px' }}>
                Spacing Scale
              </h2>
              <Card padding={32}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { name: 'xs', value: '4px', usage: 'Tight spacing, icon gaps' },
                    { name: 'sm', value: '8px', usage: 'Related elements' },
                    { name: 'md', value: '16px', usage: 'Default spacing' },
                    { name: 'lg', value: '24px', usage: 'Section padding' },
                    { name: 'xl', value: '32px', usage: 'Card padding' },
                    { name: '2xl', value: '48px', usage: 'Section gaps' },
                    { name: '3xl', value: '64px', usage: 'Page sections' },
                  ].map((space, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '60px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: palette.charcoal }}>{space.name}</p>
                        <p style={{ fontSize: '11px', color: palette.gray400 }}>{space.value}</p>
                      </div>
                      <div style={{ 
                        width: space.value, 
                        height: '24px', 
                        backgroundColor: palette.terracotta, 
                        borderRadius: '4px' 
                      }}/>
                      <p style={{ fontSize: '13px', color: palette.gray600 }}>{space.usage}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Border Radius */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Border Radius
              </h2>
              <Card padding={32}>
                <div style={{ display: 'flex', gap: '24px' }}>
                  {[
                    { name: 'sm', value: '4px', usage: 'Inputs, small elements' },
                    { name: 'md', value: '8px', usage: 'Buttons, tags' },
                    { name: 'lg', value: '12px', usage: 'Cards, modals' },
                    { name: 'xl', value: '16px', usage: 'Large cards' },
                    { name: 'full', value: '9999px', usage: 'Pills, avatars' },
                  ].map((radius, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        backgroundColor: palette.forest, 
                        borderRadius: radius.value,
                        marginBottom: '12px',
                      }}/>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: palette.charcoal }}>{radius.name}</p>
                      <p style={{ fontSize: '11px', color: palette.gray400 }}>{radius.value}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Shadows */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Shadows
              </h2>
              <Card padding={32}>
                <div style={{ display: 'flex', gap: '24px' }}>
                  {[
                    { name: 'sm', value: '0 1px 3px rgba(0,0,0,0.08)', usage: 'Subtle elevation' },
                    { name: 'md', value: '0 2px 12px rgba(0,0,0,0.06)', usage: 'Cards, default' },
                    { name: 'lg', value: '0 8px 24px rgba(0,0,0,0.1)', usage: 'Modals, dropdowns' },
                    { name: 'xl', value: '0 16px 48px rgba(0,0,0,0.12)', usage: 'Popovers' },
                  ].map((shadow, i) => (
                    <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ 
                        height: '80px', 
                        backgroundColor: 'white', 
                        borderRadius: '12px',
                        boxShadow: shadow.value,
                        marginBottom: '12px',
                      }}/>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: palette.charcoal }}>{shadow.name}</p>
                      <p style={{ fontSize: '10px', color: palette.gray400, marginTop: '4px' }}>{shadow.usage}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* GRAPHICS SECTION */}
          {activeSection === 'graphics' && (
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 600, color: palette.charcoal, marginBottom: '8px' }}>
                Graphic Elements
              </h1>
              <p style={{ fontSize: '16px', color: palette.gray600, marginBottom: '40px' }}>
                Decorative elements derived from the nest motif to add warmth and visual interest.
              </p>

              {/* Nest Curves */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginBottom: '20px' }}>
                Nest Curves
              </h2>
              <p style={{ fontSize: '14px', color: palette.gray600, marginBottom: '20px' }}>
                The primary decorative element. Use as backgrounds, dividers, or accent graphics.
              </p>
              <Card padding={0}>
                <div style={{ 
                  backgroundColor: palette.forest, 
                  padding: '64px 48px 48px', 
                  borderRadius: '16px 16px 0 0',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                    <NestCurvesGraphic width={900} height={150} color="white" opacity={0.12} />
                  </div>
                  <p style={{ color: 'white', fontSize: '14px', position: 'relative', zIndex: 1 }}>
                    Hero section with nest curves overlay
                  </p>
                </div>
                <div style={{ padding: '24px' }}>
                  <p style={{ fontSize: '13px', color: palette.gray600 }}>
                    Use at 8-15% opacity on dark backgrounds, 10-20% on light backgrounds.
                  </p>
                </div>
              </Card>

              {/* Nest Curve Variations */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '32px' }}>
                <Card padding={0}>
                  <div style={{ 
                    backgroundColor: palette.warmWhite, 
                    padding: '32px', 
                    borderRadius: '16px 16px 0 0',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '120px',
                  }}>
                    <div style={{ position: 'absolute', bottom: -20, left: -20 }}>
                      <NestCurvesGraphic width={300} height={100} color={palette.terracotta} opacity={0.2} />
                    </div>
                  </div>
                  <div style={{ padding: '16px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: palette.charcoal }}>Terracotta on Light</p>
                    <p style={{ fontSize: '12px', color: palette.gray600 }}>Cards, sections</p>
                  </div>
                </Card>

                <Card padding={0}>
                  <div style={{ 
                    backgroundColor: palette.cream, 
                    padding: '32px', 
                    borderRadius: '16px 16px 0 0',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '120px',
                  }}>
                    <div style={{ position: 'absolute', bottom: -20, left: -20 }}>
                      <NestCurvesGraphic width={300} height={100} color={palette.forest} opacity={0.1} />
                    </div>
                  </div>
                  <div style={{ padding: '16px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: palette.charcoal }}>Forest on Cream</p>
                    <p style={{ fontSize: '12px', color: palette.gray600 }}>Subtle backgrounds</p>
                  </div>
                </Card>

                <Card padding={0}>
                  <div style={{ 
                    backgroundColor: palette.charcoal, 
                    padding: '32px', 
                    borderRadius: '16px 16px 0 0',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '120px',
                  }}>
                    <div style={{ position: 'absolute', bottom: -20, left: -20 }}>
                      <NestCurvesGraphic width={300} height={100} color="white" opacity={0.08} />
                    </div>
                  </div>
                  <div style={{ padding: '16px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: palette.charcoal }}>White on Dark</p>
                    <p style={{ fontSize: '12px', color: palette.gray600 }}>Footer, dark sections</p>
                  </div>
                </Card>
              </div>

              {/* Radial & Circular Elements */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Circular Elements
              </h2>
              <p style={{ fontSize: '14px', color: palette.gray600, marginBottom: '20px' }}>
                Radial patterns and circular graphics for focal points and accents.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <Card padding={32}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '16px' }}>
                    RADIAL NEST
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', backgroundColor: palette.warmWhite, borderRadius: '8px' }}>
                    <RadialNest size={140} color={palette.terracotta} opacity={0.2} />
                  </div>
                  <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '12px' }}>Behind content, hero backgrounds</p>
                </Card>

                <Card padding={32}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '16px' }}>
                    PROGRESS ARC
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', backgroundColor: palette.warmWhite, borderRadius: '8px' }}>
                    <ProgressArc size={120} progress={0.72} color={palette.forest} />
                  </div>
                  <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '12px' }}>Project progress, stats</p>
                </Card>

                <Card padding={32}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '16px' }}>
                    BADGE/SEAL
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', backgroundColor: palette.warmWhite, borderRadius: '8px' }}>
                    <BadgeSeal size={100} color={palette.forest} accentColor={palette.terracotta} />
                  </div>
                  <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '12px' }}>Achievements, milestones</p>
                </Card>
              </div>

              {/* Organic Elements */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Organic Elements
              </h2>
              <p style={{ fontSize: '14px', color: palette.gray600, marginBottom: '20px' }}>
                Natural, organic shapes that reinforce the "nest" and "home" concepts.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <Card padding={24}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '12px' }}>
                    TWIG ACCENT
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', backgroundColor: palette.warmWhite, borderRadius: '8px', minHeight: '80px', alignItems: 'center' }}>
                    <TwigAccent width={100} color={palette.forest} opacity={0.3} />
                  </div>
                  <p style={{ fontSize: '11px', color: palette.gray600, marginTop: '8px' }}>Dividers, separators</p>
                </Card>

                <Card padding={24}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '12px' }}>
                    LEAF SHAPE
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px', backgroundColor: palette.warmWhite, borderRadius: '8px', minHeight: '80px', alignItems: 'center' }}>
                    <LeafShape size={50} color={palette.forest} opacity={0.2} rotation={-15} />
                    <LeafShape size={40} color={palette.terracotta} opacity={0.25} rotation={10} />
                  </div>
                  <p style={{ fontSize: '11px', color: palette.gray600, marginTop: '8px' }}>Scattered accents</p>
                </Card>

                <Card padding={24}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '12px' }}>
                    ABSTRACT HOUSE
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', backgroundColor: palette.warmWhite, borderRadius: '8px', minHeight: '80px', alignItems: 'center' }}>
                    <AbstractHouse size={70} color={palette.forest} accentColor={palette.terracotta} opacity={0.25} />
                  </div>
                  <p style={{ fontSize: '11px', color: palette.gray600, marginTop: '8px' }}>Empty states, icons</p>
                </Card>

                <Card padding={24}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '12px' }}>
                    CONFETTI
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '8px', backgroundColor: palette.warmWhite, borderRadius: '8px', minHeight: '80px', alignItems: 'center' }}>
                    <ConfettiGraphic size={100} />
                  </div>
                  <p style={{ fontSize: '11px', color: palette.gray600, marginTop: '8px' }}>Celebrations</p>
                </Card>
              </div>

              {/* Corner Decorations */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Corner Decorations
              </h2>
              <p style={{ fontSize: '14px', color: palette.gray600, marginBottom: '20px' }}>
                Use corner nest curves to frame content or add subtle visual interest.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <Card padding={0}>
                  <div style={{ 
                    backgroundColor: 'white', 
                    padding: '48px', 
                    borderRadius: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '200px',
                  }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0 }}>
                      <CornerNest size={120} color={palette.terracotta} position="bottom-left" />
                    </div>
                    <div style={{ position: 'absolute', top: 0, right: 0 }}>
                      <CornerNest size={80} color={palette.terracotta} position="top-right" />
                    </div>
                    <p style={{ fontSize: '14px', color: palette.gray600 }}>Card with corner accents</p>
                  </div>
                </Card>

                <Card padding={0}>
                  <div style={{ 
                    backgroundColor: palette.forest, 
                    padding: '48px', 
                    borderRadius: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '200px',
                  }}>
                    <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
                      <CornerNest size={150} color="white" position="bottom-right" />
                    </div>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Dark section with corner</p>
                  </div>
                </Card>
              </div>

              {/* Pattern Elements */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Pattern Elements
              </h2>
              <p style={{ fontSize: '14px', color: palette.gray600, marginBottom: '20px' }}>
                Repeating patterns for backgrounds and texture.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <Card padding={0}>
                  <div style={{ 
                    backgroundColor: palette.cream, 
                    padding: '24px', 
                    borderRadius: '16px 16px 0 0',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '140px',
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0 }}>
                      <DotPattern width={200} height={150} color={palette.forest} opacity={0.15} />
                    </div>
                  </div>
                  <div style={{ padding: '16px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: palette.charcoal }}>Dot Pattern</p>
                    <p style={{ fontSize: '12px', color: palette.gray600 }}>Subtle backgrounds</p>
                  </div>
                </Card>

                <Card padding={0}>
                  <div style={{ 
                    backgroundColor: palette.warmWhite, 
                    padding: '24px', 
                    borderRadius: '16px 16px 0 0',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '140px',
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0 }}>
                      <DiagonalLines width={250} height={150} color={palette.forest} opacity={0.1} />
                    </div>
                  </div>
                  <div style={{ padding: '16px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: palette.charcoal }}>Diagonal Lines</p>
                    <p style={{ fontSize: '12px', color: palette.gray600 }}>Dynamic backgrounds</p>
                  </div>
                </Card>

                <Card padding={0}>
                  <div style={{ 
                    backgroundColor: 'white', 
                    padding: '24px', 
                    borderRadius: '16px 16px 0 0',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '140px',
                    display: 'flex',
                    alignItems: 'flex-end',
                  }}>
                    <ScallopBorder width={250} color={palette.terracotta} opacity={0.25} />
                  </div>
                  <div style={{ padding: '16px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: palette.charcoal }}>Scallop Border</p>
                    <p style={{ fontSize: '12px', color: palette.gray600 }}>Section dividers</p>
                  </div>
                </Card>
              </div>

              {/* Wave Dividers */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Wave Dividers
              </h2>
              <p style={{ fontSize: '14px', color: palette.gray600, marginBottom: '20px' }}>
                Organic section transitions and layered backgrounds.
              </p>
              <Card padding={0}>
                <div style={{ 
                  backgroundColor: palette.forest, 
                  padding: '48px 32px 80px', 
                  borderRadius: '16px 16px 0 0',
                  position: 'relative',
                }}>
                  <p style={{ color: 'white', fontSize: '14px' }}>Section with wave transition</p>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                    <LayeredWaves width={800} height={80} color="white" />
                  </div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '0 0 16px 16px' }}>
                  <p style={{ fontSize: '13px', color: palette.gray600 }}>
                    Layered waves create smooth transitions between sections.
                  </p>
                </div>
              </Card>

              {/* Floating Shapes */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Floating Shapes
              </h2>
              <p style={{ fontSize: '14px', color: palette.gray600, marginBottom: '20px' }}>
                Abstract background elements for depth and visual interest.
              </p>
              <Card padding={0}>
                <div style={{ 
                  backgroundColor: palette.cream, 
                  padding: '48px', 
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '200px',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <FloatingShapes width={500} height={200} color={palette.forest} />
                  </div>
                  <div style={{ 
                    position: 'relative', 
                    zIndex: 1, 
                    backgroundColor: 'white', 
                    padding: '24px', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    maxWidth: '300px',
                  }}>
                    <p style={{ fontSize: '14px', color: palette.charcoal }}>Content card over floating shapes background</p>
                  </div>
                </div>
              </Card>

              {/* Usage Guidelines */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Usage Guidelines
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <Card padding={24}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: palette.forest, marginBottom: '12px' }}>Do</h3>
                  <ul style={{ fontSize: '14px', color: palette.gray600, lineHeight: 1.8, paddingLeft: '16px' }}>
                    <li>Use graphics at low opacity (8-25%)</li>
                    <li>Position elements at edges or corners</li>
                    <li>Maintain breathing room around graphics</li>
                    <li>Use one primary graphic per section</li>
                    <li>Combine nest curves with solid backgrounds</li>
                  </ul>
                </Card>
                <Card padding={24}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: palette.error, marginBottom: '12px' }}>Don't</h3>
                  <ul style={{ fontSize: '14px', color: palette.gray600, lineHeight: 1.8, paddingLeft: '16px' }}>
                    <li>Use graphics at high opacity (over 30%)</li>
                    <li>Stack multiple prominent graphics</li>
                    <li>Place graphics behind text content</li>
                    <li>Stretch or distort patterns</li>
                    <li>Mix too many different element types</li>
                  </ul>
                </Card>
              </div>
            </div>
          )}

          {/* ANIMATION SECTION */}
          {activeSection === 'animation' && (
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 600, color: palette.charcoal, marginBottom: '8px' }}>
                Animation
              </h1>
              <p style={{ fontSize: '16px', color: palette.gray600, marginBottom: '40px' }}>
                Motion principles that bring warmth and delight to the HomeNest experience.
              </p>

              {/* Principles */}
              <Card padding={40}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginBottom: '24px' }}>
                  Motion Principles
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                  <div>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: palette.cream,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}>
                      <span style={{ fontSize: '20px', color: palette.forest, fontWeight: 600 }}>1</span>
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: palette.charcoal, marginBottom: '8px' }}>Purposeful</h3>
                    <p style={{ fontSize: '14px', color: palette.gray600, lineHeight: 1.6 }}>
                      Every animation should have a reason. Guide attention, provide feedback, or create continuity.
                    </p>
                  </div>
                  <div>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: palette.cream,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}>
                      <span style={{ fontSize: '20px', color: palette.forest, fontWeight: 600 }}>2</span>
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: palette.charcoal, marginBottom: '8px' }}>Gentle</h3>
                    <p style={{ fontSize: '14px', color: palette.gray600, lineHeight: 1.6 }}>
                      Animations should feel calm and reassuring, never jarring or frantic. Ease in and out smoothly.
                    </p>
                  </div>
                  <div>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: palette.cream,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}>
                      <span style={{ fontSize: '20px', color: palette.forest, fontWeight: 600 }}>3</span>
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: palette.charcoal, marginBottom: '8px' }}>Quick</h3>
                    <p style={{ fontSize: '14px', color: palette.gray600, lineHeight: 1.6 }}>
                      Keep durations short. Users should never wait for animations to complete before acting.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Animated Graphics */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Animated Graphics
              </h2>
              <p style={{ fontSize: '14px', color: palette.gray600, marginBottom: '20px' }}>
                Subtle motion applied to graphic elements creates life and visual interest.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {/* Breathing Nest */}
                <Card padding={0}>
                  <div style={{ 
                    backgroundColor: palette.forest, 
                    padding: '48px', 
                    borderRadius: '16px 16px 0 0',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '180px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}>
                    <svg width="300" height="100" viewBox="0 0 300 100" fill="none" style={{ animation: 'breathe 4s ease-in-out infinite' }}>
                      <path d="M0 80C50 100 100 60 150 70C200 80 250 100 300 80" stroke="white" strokeWidth="8" strokeLinecap="round" opacity="0.15"/>
                      <path d="M20 90C60 75 110 95 150 85C190 75 240 95 280 85" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.12"/>
                      <path d="M50 95C80 88 120 98 150 92C180 86 220 96 250 92" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.08"/>
                    </svg>
                  </div>
                  <div style={{ padding: '20px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: palette.charcoal }}>Breathing Nest</p>
                    <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '4px' }}>Gentle scale pulse for hero backgrounds. 4s duration, ease-in-out.</p>
                    <code style={{ fontSize: '11px', color: palette.gray400, display: 'block', marginTop: '8px' }}>
                      animation: breathe 4s ease-in-out infinite
                    </code>
                  </div>
                </Card>

                {/* Floating Elements */}
                <Card padding={0}>
                  <div style={{ 
                    backgroundColor: palette.cream, 
                    padding: '32px', 
                    borderRadius: '16px 16px 0 0',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '180px',
                  }}>
                    <div style={{ position: 'absolute', top: '20px', left: '30px', animation: 'float 4s ease-in-out infinite' }}>
                      <LeafShape size={40} color={palette.forest} opacity={0.15} rotation={-10} />
                    </div>
                    <div style={{ position: 'absolute', top: '60px', right: '40px', animation: 'float 5s ease-in-out infinite', animationDelay: '1s' }}>
                      <LeafShape size={30} color={palette.terracotta} opacity={0.2} rotation={15} />
                    </div>
                    <div style={{ position: 'absolute', bottom: '30px', left: '50%', animation: 'float 4.5s ease-in-out infinite', animationDelay: '0.5s' }}>
                      <LeafShape size={35} color={palette.forest} opacity={0.12} rotation={5} />
                    </div>
                  </div>
                  <div style={{ padding: '20px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: palette.charcoal }}>Floating Elements</p>
                    <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '4px' }}>Staggered vertical movement. Vary duration 3.5-5.5s per element.</p>
                    <code style={{ fontSize: '11px', color: palette.gray400, display: 'block', marginTop: '8px' }}>
                      animation: float 4s ease-in-out infinite
                    </code>
                  </div>
                </Card>

                {/* Pulsing Radial */}
                <Card padding={0}>
                  <div style={{ 
                    backgroundColor: palette.warmWhite, 
                    padding: '32px', 
                    borderRadius: '16px 16px 0 0',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animation: 'ripple 3s ease-out infinite' }}>
                        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
                          <circle cx="80" cy="80" r="70" stroke={palette.terracotta} strokeWidth="2" opacity="0.2" fill="none"/>
                        </svg>
                      </div>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animation: 'ripple 3s ease-out infinite', animationDelay: '1s' }}>
                        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
                          <circle cx="80" cy="80" r="70" stroke={palette.terracotta} strokeWidth="2" opacity="0.2" fill="none"/>
                        </svg>
                      </div>
                      <RadialNest size={100} color={palette.terracotta} opacity={0.2} />
                    </div>
                  </div>
                  <div style={{ padding: '20px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: palette.charcoal }}>Pulsing Radial</p>
                    <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '4px' }}>Expanding ripple effect for focus states or loading.</p>
                    <code style={{ fontSize: '11px', color: palette.gray400, display: 'block', marginTop: '8px' }}>
                      animation: ripple 3s ease-out infinite
                    </code>
                  </div>
                </Card>

                {/* Swaying Twig */}
                <Card padding={0}>
                  <div style={{ 
                    backgroundColor: palette.forest, 
                    padding: '32px', 
                    borderRadius: '16px 16px 0 0',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="200" height="80" viewBox="0 0 200 80" fill="none" style={{ animation: 'sway 3s ease-in-out infinite', transformOrigin: 'center bottom' }}>
                      <path d="M20 70C50 70 70 40 100 40C130 40 150 70 180 70" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.2"/>
                      <path d="M60 40C60 40 55 25 70 18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.15"/>
                      <path d="M100 40C100 40 100 22 115 14" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.15"/>
                      <path d="M140 50C140 50 150 35 142 25" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.15"/>
                    </svg>
                  </div>
                  <div style={{ padding: '20px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: palette.charcoal }}>Swaying Twig</p>
                    <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '4px' }}>Gentle rotation for organic elements. Transform origin at base.</p>
                    <code style={{ fontSize: '11px', color: palette.gray400, display: 'block', marginTop: '8px' }}>
                      animation: sway 3s ease-in-out infinite
                    </code>
                  </div>
                </Card>

                {/* Celebration Confetti */}
                <Card padding={0}>
                  <div style={{ 
                    backgroundColor: palette.warmWhite, 
                    padding: '32px', 
                    borderRadius: '16px 16px 0 0',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <ConfettiGraphic size={180} animated={true} />
                  </div>
                  <div style={{ padding: '20px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: palette.charcoal }}>Celebration Confetti</p>
                    <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '4px' }}>Falling + rotating motion for success moments. Use sparingly.</p>
                    <code style={{ fontSize: '11px', color: palette.gray400, display: 'block', marginTop: '8px' }}>
                      animation: confettiFall 2s ease-in-out infinite
                    </code>
                  </div>
                </Card>

                {/* Flowing Wave */}
                <Card padding={0}>
                  <div style={{ 
                    backgroundColor: palette.charcoal, 
                    padding: '32px', 
                    borderRadius: '16px 16px 0 0',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '180px',
                    display: 'flex',
                    alignItems: 'flex-end',
                  }}>
                    <svg width="100%" height="80" viewBox="0 0 400 80" fill="none" preserveAspectRatio="none" style={{ animation: 'wave 4s ease-in-out infinite' }}>
                      <path d="M0 50C80 30 160 70 240 45C320 20 360 60 400 50V80H0V50Z" fill={palette.terracotta} opacity="0.15"/>
                      <path d="M0 60C60 45 140 75 220 55C300 35 350 65 400 55V80H0V60Z" fill={palette.terracotta} opacity="0.2"/>
                    </svg>
                  </div>
                  <div style={{ padding: '20px 24px', backgroundColor: palette.gray100 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: palette.charcoal }}>Flowing Wave</p>
                    <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '4px' }}>Gentle vertical movement for section transitions or footer.</p>
                    <code style={{ fontSize: '11px', color: palette.gray400, display: 'block', marginTop: '8px' }}>
                      animation: wave 4s ease-in-out infinite
                    </code>
                  </div>
                </Card>
              </div>

              {/* Progress Animation */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Progress Animation
              </h2>
              <Card padding={32}>
                <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <ProgressArc size={120} progress={0.72} color={palette.forest} />
                      <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: '24px',
                        fontWeight: 500,
                        color: palette.forest,
                      }}>72%</div>
                    </div>
                    <p style={{ fontSize: '12px', color: palette.gray600 }}>Static progress</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', color: palette.gray600, marginBottom: '16px' }}>
                      Progress arcs should animate from 0 to the target value on first appearance. Use <code style={{ backgroundColor: palette.gray100, padding: '2px 6px', borderRadius: '4px' }}>stroke-dashoffset</code> transitions.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: palette.charcoal }}>Duration</p>
                        <p style={{ fontSize: '12px', color: palette.gray600 }}>800ms - 1200ms depending on percentage</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: palette.charcoal }}>Easing</p>
                        <p style={{ fontSize: '12px', color: palette.gray600 }}>ease-out for natural deceleration</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: palette.charcoal }}>Delay</p>
                        <p style={{ fontSize: '12px', color: palette.gray600 }}>200ms after element appears</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Timing */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Duration & Easing
              </h2>
              <Card padding={32}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: palette.forest, marginBottom: '16px' }}>UI Durations</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { name: 'Instant', value: '100ms', usage: 'Hover states, toggles' },
                        { name: 'Fast', value: '200ms', usage: 'Buttons, small elements' },
                        { name: 'Normal', value: '300ms', usage: 'Cards, modals opening' },
                        { name: 'Slow', value: '400ms', usage: 'Page transitions' },
                        { name: 'Slower', value: '500ms', usage: 'Complex sequences' },
                      ].map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '80px' }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: palette.charcoal }}>{d.name}</p>
                          </div>
                          <code style={{ 
                            fontSize: '12px', 
                            backgroundColor: palette.gray100, 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            width: '60px',
                          }}>{d.value}</code>
                          <p style={{ fontSize: '12px', color: palette.gray600 }}>{d.usage}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: palette.forest, marginBottom: '16px' }}>Graphic Durations</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { name: 'Ripple', value: '3s', usage: 'Expanding circles' },
                        { name: 'Breathe', value: '4s', usage: 'Scaling backgrounds' },
                        { name: 'Float', value: '4-5.5s', usage: 'Floating elements (vary)' },
                        { name: 'Sway', value: '3s', usage: 'Gentle rotation' },
                        { name: 'Wave', value: '4s', usage: 'Flowing sections' },
                      ].map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '80px' }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: palette.charcoal }}>{d.name}</p>
                          </div>
                          <code style={{ 
                            fontSize: '12px', 
                            backgroundColor: palette.gray100, 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            width: '60px',
                          }}>{d.value}</code>
                          <p style={{ fontSize: '12px', color: palette.gray600 }}>{d.usage}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Easing Functions */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Easing Functions
              </h2>
              <Card padding={32}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                  {[
                    { name: 'ease-out', value: 'cubic-bezier(0, 0, 0.2, 1)', usage: 'Elements entering, graphics appearing' },
                    { name: 'ease-in', value: 'cubic-bezier(0.4, 0, 1, 1)', usage: 'Elements exiting' },
                    { name: 'ease-in-out', value: 'cubic-bezier(0.4, 0, 0.2, 1)', usage: 'Looping graphics, breathing' },
                    { name: 'bounce', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', usage: 'Playful emphasis, celebrations' },
                  ].map((e, i) => (
                    <div key={i} style={{ padding: '16px', backgroundColor: palette.warmWhite, borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: palette.charcoal }}>{e.name}</p>
                      </div>
                      <code style={{ fontSize: '11px', color: palette.gray400, display: 'block', marginBottom: '8px' }}>{e.value}</code>
                      <p style={{ fontSize: '12px', color: palette.gray600 }}>{e.usage}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Animation Types */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                UI Animation Types
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <Card padding={24}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '16px' }}>
                    FADE IN UP
                  </p>
                  <div style={{ 
                    height: '80px', 
                    backgroundColor: palette.warmWhite, 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '120px',
                      height: '40px',
                      backgroundColor: palette.forest,
                      borderRadius: '8px',
                      animation: 'fadeInUp 0.5s ease-out infinite',
                      animationDelay: '0s',
                    }}/>
                  </div>
                  <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '12px' }}>Cards, list items, content blocks</p>
                </Card>

                <Card padding={24}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '16px' }}>
                    FADE IN SCALE
                  </p>
                  <div style={{ 
                    height: '80px', 
                    backgroundColor: palette.warmWhite, 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: palette.terracotta,
                      borderRadius: '12px',
                      animation: 'fadeInScale 0.5s ease-out infinite',
                    }}/>
                  </div>
                  <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '12px' }}>Modals, popovers, tooltips</p>
                </Card>

                <Card padding={24}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '16px' }}>
                    SLIDE IN
                  </p>
                  <div style={{ 
                    height: '80px', 
                    backgroundColor: palette.warmWhite, 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: '80px',
                      height: '40px',
                      backgroundColor: palette.forest,
                      borderRadius: '8px',
                      animation: 'slideInLeft 0.5s ease-out infinite',
                    }}/>
                  </div>
                  <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '12px' }}>Drawers, side panels, notifications</p>
                </Card>

                <Card padding={24}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.1em', marginBottom: '16px' }}>
                    BOUNCE IN
                  </p>
                  <div style={{ 
                    height: '80px', 
                    backgroundColor: palette.warmWhite, 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: palette.terracotta,
                      borderRadius: '50%',
                      animation: 'bounceIn 0.6s ease-out infinite',
                    }}/>
                  </div>
                  <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '12px' }}>Success states, celebratory moments</p>
                </Card>
              </div>

              {/* Stagger Pattern */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Stagger Pattern
              </h2>
              <Card padding={32}>
                <p style={{ fontSize: '14px', color: palette.gray600, marginBottom: '24px' }}>
                  When animating multiple items, stagger their entrance by 50-100ms to create a flowing effect.
                </p>
                <div style={{ 
                  display: 'flex', 
                  gap: '12px',
                  padding: '24px',
                  backgroundColor: palette.warmWhite,
                  borderRadius: '12px',
                }}>
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      style={{
                        width: '60px',
                        height: '80px',
                        backgroundColor: palette.forest,
                        borderRadius: '8px',
                        animation: 'fadeInUp 0.4s ease-out forwards',
                        animationDelay: `${i * 0.08}s`,
                        opacity: 0,
                      }}
                    />
                  ))}
                </div>
                <code style={{ fontSize: '12px', color: palette.gray400, display: 'block', marginTop: '16px' }}>
                  animation-delay: calc(index * 80ms)
                </code>
              </Card>

              {/* CSS Code Reference */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                CSS Reference
              </h2>
              <Card padding={32}>
                <pre style={{ 
                  fontSize: '12px', 
                  color: palette.charcoal, 
                  backgroundColor: palette.gray100, 
                  padding: '24px', 
                  borderRadius: '8px',
                  overflow: 'auto',
                  lineHeight: 1.6,
                }}>
{`/* UI Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.3); }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

/* Graphic Animations */
@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.15; }
  50% { transform: scale(1.05); opacity: 0.25; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes sway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

@keyframes ripple {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes wave {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(2deg); }
  75% { transform: translateY(5px) rotate(-2deg); }
}

/* Usage Examples */
.hero-background { animation: breathe 4s ease-in-out infinite; }
.floating-leaf { animation: float 4.5s ease-in-out infinite; }
.twig-decoration { animation: sway 3s ease-in-out infinite; }
.card { animation: fadeInUp 0.3s ease-out; }
.modal { animation: fadeInScale 0.2s ease-out; }`}
                </pre>
              </Card>
            </div>
          )}

          {/* COMPONENTS SECTION */}
          {activeSection === 'components' && (
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 600, color: palette.charcoal, marginBottom: '8px' }}>
                UI Components
              </h1>
              <p style={{ fontSize: '16px', color: palette.gray600, marginBottom: '40px' }}>
                Reusable components that form the building blocks of HomeNest.
              </p>

              {/* Buttons */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginBottom: '20px' }}>
                Buttons
              </h2>
              <Card padding={32}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: palette.gray400, marginBottom: '12px' }}>VARIANTS</p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="accent">Accent</Button>
                      <Button variant="ghost">Ghost</Button>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: palette.gray400, marginBottom: '12px' }}>SIZES</p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Button variant="primary" size="sm">Small</Button>
                      <Button variant="primary" size="md">Medium</Button>
                      <Button variant="primary" size="lg">Large</Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Inputs */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Form Elements
              </h2>
              <Card padding={32}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <InputField label="Project Name" placeholder="Kitchen Renovation" />
                  <InputField label="Budget" placeholder="$25,000" />
                </div>
              </Card>

              {/* Cards */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Cards
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <Card padding={24}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.05em', marginBottom: '8px' }}>PROJECT</p>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: palette.charcoal, marginBottom: '4px' }}>Kitchen Renovation</h3>
                  <p style={{ fontSize: '13px', color: palette.gray600, marginBottom: '16px' }}>68% complete</p>
                  <div style={{ height: '6px', backgroundColor: palette.gray200, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '68%', height: '100%', backgroundColor: palette.forest, borderRadius: '3px' }}/>
                  </div>
                </Card>
                
                <Card padding={24}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.05em', marginBottom: '8px' }}>BUDGET</p>
                  <h3 style={{ fontSize: '24px', fontWeight: 600, color: palette.forest, marginBottom: '4px', fontFamily: "'Fraunces', Georgia, serif" }}>$18,500</h3>
                  <p style={{ fontSize: '13px', color: palette.gray600 }}>of $25,000 spent</p>
                  <p style={{ fontSize: '12px', color: palette.success, marginTop: '12px', fontWeight: 500 }}>On track</p>
                </Card>

                <div style={{ backgroundColor: palette.cream, borderRadius: '16px', padding: '24px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: palette.gray400, letterSpacing: '0.05em', marginBottom: '8px' }}>TIP</p>
                  <p style={{ fontSize: '14px', color: palette.charcoal, lineHeight: 1.5 }}>
                    Add receipts as you go to keep your budget accurate.
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Status Badges
              </h2>
              <Card padding={32}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[
                    { label: 'On Track', bg: '#E8F5E9', color: '#4CAF50' },
                    { label: 'At Risk', bg: '#FFF3E0', color: '#FF9800' },
                    { label: 'Over Budget', bg: '#FFEBEE', color: '#E53935' },
                    { label: 'Complete', bg: palette.cream, color: palette.forest },
                  ].map((badge, i) => (
                    <span key={i} style={{
                      padding: '6px 12px',
                      backgroundColor: badge.bg,
                      color: badge.color,
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: '6px',
                    }}>
                      {badge.label}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* MOBILE SECTION */}
          {activeSection === 'mobile' && (
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 600, color: palette.charcoal, marginBottom: '8px' }}>
                Mobile Application
              </h1>
              <p style={{ fontSize: '16px', color: palette.gray600, marginBottom: '40px' }}>
                Guidelines specific to the HomeNest iOS and Android applications.
              </p>

              {/* Splash Screen */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginBottom: '20px' }}>
                Splash Screen
              </h2>
              <Card padding={32}>
                <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
                  {/* Interactive Demo */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '240px',
                      backgroundColor: '#1a1a1a',
                      borderRadius: '40px',
                      padding: '12px',
                    }}>
                      <div style={{
                        width: '100%',
                        height: '480px',
                        borderRadius: '32px',
                        overflow: 'hidden',
                      }}>
                        <AnimatedSplash playing={splashPlaying} />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSplashPlaying(false);
                        setTimeout(() => setSplashPlaying(true), 50);
                      }}
                      style={{
                        marginTop: '16px',
                        padding: '10px 24px',
                        backgroundColor: palette.forest,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      Play Animation
                    </button>
                  </div>

                  {/* Specs */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: palette.charcoal, marginBottom: '16px' }}>
                      Animation Sequence
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { step: '1', time: '0-200ms', desc: 'First nest curve fades in (opacity 0.3)' },
                        { step: '2', time: '200-500ms', desc: 'Second nest curve fades in (opacity 0.25)' },
                        { step: '3', time: '500-800ms', desc: 'Third curve + icon scales up with bounce' },
                        { step: '4', time: '800-1100ms', desc: '"HomeNest" text fades in and up' },
                        { step: '5', time: '1100-1400ms', desc: 'Tagline fades in' },
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: palette.cream,
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: palette.forest,
                            flexShrink: 0,
                          }}>
                            {item.step}
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: palette.gray400 }}>{item.time}</p>
                            <p style={{ fontSize: '14px', color: palette.charcoal }}>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '24px', padding: '16px', backgroundColor: palette.cream, borderRadius: '8px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: palette.forest, marginBottom: '8px' }}>
                        Key Specs
                      </p>
                      <ul style={{ fontSize: '13px', color: palette.gray600, paddingLeft: '16px', lineHeight: 1.8 }}>
                        <li>Total duration: ~1.5 seconds</li>
                        <li>Background: White (#FFFFFF)</li>
                        <li>Easing: ease-out for fades, bounce for icon</li>
                        <li>Minimum display: 2 seconds</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>

              {/* App Icons */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                App Icons
              </h2>
              <Card padding={32}>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-end' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      backgroundColor: palette.forest,
                      borderRadius: '27px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }}>
                      <NestIcon size={80} color="white" accentColor={palette.terracotta} />
                    </div>
                    <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '12px' }}>iOS App Store</p>
                    <p style={{ fontSize: '11px', color: palette.gray400 }}>1024 x 1024px</p>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '96px',
                      height: '96px',
                      backgroundColor: palette.forest,
                      borderRadius: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <NestIcon size={64} color="white" accentColor={palette.terracotta} />
                    </div>
                    <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '12px' }}>Android</p>
                    <p style={{ fontSize: '11px', color: palette.gray400 }}>512 x 512px</p>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: palette.forest,
                      borderRadius: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <NestIcon size={40} color="white" accentColor={palette.terracotta} />
                    </div>
                    <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '12px' }}>Home Screen</p>
                    <p style={{ fontSize: '11px', color: palette.gray400 }}>60 x 60pt @3x</p>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: palette.forest,
                      borderRadius: '9px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <NestIcon size={26} color="white" accentColor={palette.terracotta} />
                    </div>
                    <p style={{ fontSize: '12px', color: palette.gray600, marginTop: '12px' }}>Spotlight</p>
                    <p style={{ fontSize: '11px', color: palette.gray400 }}>40 x 40pt @3x</p>
                  </div>
                </div>
              </Card>

              {/* Mobile Typography */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Mobile Type Scale
              </h2>
              <Card padding={32}>
                <p style={{ fontSize: '13px', color: palette.gray600, marginBottom: '24px' }}>
                  Slightly adjusted sizes for optimal mobile readability.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: palette.gray400, marginBottom: '12px' }}>HEADLINES</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p><span style={{ fontSize: '11px', color: palette.gray400, width: '40px', display: 'inline-block' }}>H1</span> <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '28px', fontWeight: 500 }}>28px Fraunces</span></p>
                      <p><span style={{ fontSize: '11px', color: palette.gray400, width: '40px', display: 'inline-block' }}>H2</span> <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '22px', fontWeight: 500 }}>22px Fraunces</span></p>
                      <p><span style={{ fontSize: '11px', color: palette.gray400, width: '40px', display: 'inline-block' }}>H3</span> <span style={{ fontSize: '18px', fontWeight: 600 }}>18px Outfit</span></p>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: palette.gray400, marginBottom: '12px' }}>BODY</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p><span style={{ fontSize: '11px', color: palette.gray400, width: '60px', display: 'inline-block' }}>Body</span> <span style={{ fontSize: '16px' }}>16px Outfit</span></p>
                      <p><span style={{ fontSize: '11px', color: palette.gray400, width: '60px', display: 'inline-block' }}>Small</span> <span style={{ fontSize: '14px' }}>14px Outfit</span></p>
                      <p><span style={{ fontSize: '11px', color: palette.gray400, width: '60px', display: 'inline-block' }}>Caption</span> <span style={{ fontSize: '12px' }}>12px Outfit</span></p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Mobile Spacing */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginTop: '48px', marginBottom: '20px' }}>
                Mobile Spacing
              </h2>
              <Card padding={32}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: palette.gray400, marginBottom: '12px' }}>SAFE AREAS</p>
                    <ul style={{ fontSize: '14px', color: palette.gray600, lineHeight: 1.8, paddingLeft: '16px' }}>
                      <li>Respect iOS safe area insets</li>
                      <li>16px minimum horizontal padding</li>
                      <li>24px section spacing</li>
                    </ul>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: palette.gray400, marginBottom: '12px' }}>TOUCH TARGETS</p>
                    <ul style={{ fontSize: '14px', color: palette.gray600, lineHeight: 1.8, paddingLeft: '16px' }}>
                      <li>44pt minimum touch target (iOS)</li>
                      <li>48dp minimum touch target (Android)</li>
                      <li>8px minimum spacing between targets</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* DO'S & DON'TS SECTION */}
          {activeSection === 'donts' && (
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 600, color: palette.charcoal, marginBottom: '8px' }}>
                Do's & Don'ts
              </h1>
              <p style={{ fontSize: '16px', color: palette.gray600, marginBottom: '40px' }}>
                Guidelines to maintain brand consistency.
              </p>

              {/* No Emojis - Prominent */}
              <Card padding={32} style={{ marginBottom: '32px', border: `2px solid ${palette.error}` }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#FFEBEE',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={palette.error} strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: palette.charcoal, marginBottom: '8px' }}>
                      No Emojis — Ever
                    </h3>
                    <p style={{ fontSize: '14px', color: palette.gray600, lineHeight: 1.6, marginBottom: '16px' }}>
                      HomeNest does not use emojis in any context: UI, notifications, marketing, documentation, or support. 
                      Our brand communicates warmth and personality through thoughtful language, not symbols.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{ backgroundColor: '#FFEBEE', padding: '12px 16px', borderRadius: '8px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: palette.error, marginBottom: '4px' }}>DON'T</p>
                        <p style={{ fontSize: '14px', color: palette.charcoal }}>"Budget on track! 🎉"</p>
                        <p style={{ fontSize: '14px', color: palette.charcoal, marginTop: '4px' }}>"Welcome to HomeNest 🏠"</p>
                        <p style={{ fontSize: '14px', color: palette.charcoal, marginTop: '4px' }}>"Task complete ✓"</p>
                      </div>
                      <div style={{ backgroundColor: '#E8F5E9', padding: '12px 16px', borderRadius: '8px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: palette.success, marginBottom: '4px' }}>DO</p>
                        <p style={{ fontSize: '14px', color: palette.charcoal }}>"Budget on track. Nice work!"</p>
                        <p style={{ fontSize: '14px', color: palette.charcoal, marginTop: '4px' }}>"Welcome to HomeNest"</p>
                        <p style={{ fontSize: '14px', color: palette.charcoal, marginTop: '4px' }}>"Task complete"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Logo Don'ts */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginBottom: '20px' }}>
                Logo Usage
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '48px' }}>
                <Card padding={24}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: palette.success, fontSize: '12px', fontWeight: 700 }}>✓</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: palette.success }}>Do</span>
                  </div>
                  <div style={{ backgroundColor: palette.warmWhite, padding: '24px', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                    <LogoFull size={48} />
                  </div>
                  <p style={{ fontSize: '13px', color: palette.gray600, marginTop: '12px' }}>Use approved color combinations</p>
                </Card>

                <Card padding={24}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#FFEBEE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: palette.error, fontSize: '12px', fontWeight: 700 }}>✗</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: palette.error }}>Don't</span>
                  </div>
                  <div style={{ backgroundColor: palette.warmWhite, padding: '24px', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                    <LogoFull size={48} color="#FF6B6B" accentColor="#4ECDC4" />
                  </div>
                  <p style={{ fontSize: '13px', color: palette.gray600, marginTop: '12px' }}>Use unapproved colors</p>
                </Card>

                <Card padding={24}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: palette.success, fontSize: '12px', fontWeight: 700 }}>✓</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: palette.success }}>Do</span>
                  </div>
                  <div style={{ backgroundColor: palette.warmWhite, padding: '24px', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                    <LogoFull size={48} />
                  </div>
                  <p style={{ fontSize: '13px', color: palette.gray600, marginTop: '12px' }}>Maintain proportions</p>
                </Card>

                <Card padding={24}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#FFEBEE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: palette.error, fontSize: '12px', fontWeight: 700 }}>✗</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: palette.error }}>Don't</span>
                  </div>
                  <div style={{ backgroundColor: palette.warmWhite, padding: '24px', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ transform: 'scaleX(1.5)' }}>
                      <LogoFull size={48} />
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: palette.gray600, marginTop: '12px' }}>Stretch or distort the logo</p>
                </Card>

                <Card padding={24}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: palette.success, fontSize: '12px', fontWeight: 700 }}>✓</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: palette.success }}>Do</span>
                  </div>
                  <div style={{ backgroundColor: palette.forest, padding: '24px', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                    <LogoFull size={48} color="white" accentColor={palette.terracotta} />
                  </div>
                  <p style={{ fontSize: '13px', color: palette.gray600, marginTop: '12px' }}>Use white logo on dark backgrounds</p>
                </Card>

                <Card padding={24}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#FFEBEE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: palette.error, fontSize: '12px', fontWeight: 700 }}>✗</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: palette.error }}>Don't</span>
                  </div>
                  <div style={{ backgroundColor: palette.terracotta, padding: '24px', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                    <LogoFull size={48} />
                  </div>
                  <p style={{ fontSize: '13px', color: palette.gray600, marginTop: '12px' }}>Place on low-contrast backgrounds</p>
                </Card>
              </div>

              {/* Typography Don'ts */}
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: palette.charcoal, marginBottom: '20px' }}>
                Typography
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <Card padding={24}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: palette.success, fontSize: '12px', fontWeight: 700 }}>✓</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: palette.success }}>Do</span>
                  </div>
                  <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '24px', color: palette.charcoal }}>
                    Use Fraunces for headlines
                  </p>
                </Card>

                <Card padding={24}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#FFEBEE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: palette.error, fontSize: '12px', fontWeight: 700 }}>✗</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: palette.error }}>Don't</span>
                  </div>
                  <p style={{ fontFamily: "Arial, sans-serif", fontSize: '24px', color: palette.charcoal }}>
                    Use system fonts for headlines
                  </p>
                </Card>

                <Card padding={24}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: palette.success, fontSize: '12px', fontWeight: 700 }}>✓</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: palette.success }}>Do</span>
                  </div>
                  <p style={{ fontSize: '15px', color: palette.gray600, lineHeight: 1.6 }}>
                    Keep body text readable with proper line height and spacing.
                  </p>
                </Card>

                <Card padding={24}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#FFEBEE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: palette.error, fontSize: '12px', fontWeight: 700 }}>✗</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: palette.error }}>Don't</span>
                  </div>
                  <p style={{ fontSize: '15px', color: palette.gray600, lineHeight: 1.1 }}>
                    Cram text together with tight line height making it hard to read.
                  </p>
                </Card>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
