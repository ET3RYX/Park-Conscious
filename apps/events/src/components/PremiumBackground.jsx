import React from 'react';

const PremiumBackground = ({ children, themeConfig }) => {
  const [videoLoaded, setVideoLoaded] = React.useState(false);
  const style = themeConfig?.themeStyle || 'pastel-light';
  const displayMode = themeConfig?.displayMode || 'light';
  const videoUrl = themeConfig?.backgroundVideoUrl || '';
  const primaryColor = themeConfig?.primaryColor || '#E33B76';

  // Determine base text and selection colors based on display mode
  const textClass = displayMode === 'dark' ? 'text-white selection:bg-indigo-500/30' : 'text-slate-900 selection:bg-pink-500/30';
  const bgBaseClass = displayMode === 'dark' ? 'bg-[#050507]' : 'bg-[#fdfbfb]';

  return (
    <div className={`relative min-h-screen w-full overflow-x-hidden ${textClass} ${bgBaseClass}`}>
      
      {/* Background Layers */}
      {style === 'video' && videoUrl ? (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Static Placeholder / Poster Image */}
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-40'}`}
            style={{ backgroundImage: `url(${videoUrl.replace('.mp4', '.jpg')})` }} 
          />
          
          {/* Lazy Loaded Video */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            onCanPlay={() => setVideoLoaded(true)}
            className={`object-cover w-full h-full transition-opacity duration-1000 ${videoLoaded ? 'opacity-40' : 'opacity-0'}`}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          {displayMode === 'dark' && <div className="absolute inset-0 bg-black/60 mix-blend-overlay"></div>}
        </div>
      ) : style === 'warp' ? (
        <div className={`fixed inset-0 z-0 pointer-events-none ${displayMode === 'dark' ? 'opacity-80' : 'opacity-100'}`} style={{ backgroundImage: displayMode === 'dark' ? `radial-gradient(circle at center, ${primaryColor}40 0%, #000000 100%)` : `radial-gradient(circle at center, ${primaryColor}20 0%, #f3e8fd 100%)` }}>
          {/* Simulate warp particles or just a deep gradient for now */}
          <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] ${displayMode === 'dark' ? 'opacity-40' : 'opacity-20 invert'}`}></div>
        </div>
      ) : style === 'minimal' ? (
        <>
          <div className={`fixed inset-0 z-0 pointer-events-none opacity-90 bg-gradient-to-b ${displayMode === 'dark' ? 'from-transparent to-black/5' : 'from-transparent to-slate-200/50'}`}></div>
          <div className={`fixed inset-0 z-0 pointer-events-none ${displayMode === 'dark' ? 'mix-blend-screen opacity-[0.03]' : 'mix-blend-multiply opacity-[0.05]'}`} style={{ backgroundColor: primaryColor }}></div>
        </>
      ) : (
        /* Default: pastel-light mesh */
        <>
          <div className="fixed inset-0 z-0 pointer-events-none animate-pastel-bg opacity-80" style={{ backgroundColor: displayMode === 'dark' ? '#000000' : '#ffffff' }}></div>
          {displayMode === 'light' ? (
            <>
              <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] mix-blend-multiply pointer-events-none animate-mesh" style={{ backgroundColor: primaryColor, opacity: 0.15 }}></div>
              <div className="fixed bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] mix-blend-multiply pointer-events-none animate-mesh" style={{ backgroundColor: primaryColor, opacity: 0.10, animationDelay: '2s' }}></div>
            </>
          ) : (
             <>
              <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] mix-blend-screen pointer-events-none animate-mesh" style={{ backgroundColor: primaryColor, opacity: 0.15 }}></div>
              <div className="fixed bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-mesh" style={{ backgroundColor: primaryColor, opacity: 0.10, animationDelay: '2s' }}></div>
            </>
          )}
        </>
      )}
      
      {/* Subtle noise overlay for premium texture (applies to all non-video styles) */}
      {style !== 'video' && (
        <div 
          className={`fixed inset-0 z-0 pointer-events-none mix-blend-overlay ${displayMode === 'dark' ? 'opacity-10' : 'opacity-[0.25]'}`}
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        ></div>
      )}
      
      {/* Content Wrapper */}
      <div className="relative z-10 w-full min-h-screen" style={{ fontFamily: themeConfig?.fontFamily || 'inherit' }}>
        {children}
      </div>
    </div>
  );
};

export default PremiumBackground;
