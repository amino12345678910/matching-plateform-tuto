'use client';
import {ArrowRight, Pause, Play, Search} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';

function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay fallback
      });
    }
  }, []);

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <section
      className="hidden lg:flex relative min-h-[560px] xl:min-h-[620px] w-full items-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)',
      }}
    >
      {/* Background Video (loads smoothly over instant dark-emerald backdrop) */}
      <video
        ref={videoRef}
        src="/assets/DesktopHeader.mp4"
        poster="/assets/tutoring-academy.jpg"
        preload="auto"
        playsInline
        autoPlay
        muted
        loop
        onLoadedData={() => setVideoReady(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          videoReady ? 'opacity-90' : 'opacity-40'
        }`}
      />

      {/* Readability Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(2,44,34,0.85) 0%, rgba(2,44,34,0.58) 55%, rgba(0,0,0,0.25) 100%)',
        }}
      />

      {/* Play/Pause Button */}
      <button
        onClick={toggleVideo}
        type="button"
        aria-label={isPlaying ? 'Pause video' : 'Play video'}
        className="absolute bottom-6 right-6 z-20 rounded-full p-3 shadow-lg transition hover:scale-105 cursor-pointer"
        style={{backgroundColor: 'rgba(31, 41, 55, 0.85)', color: 'white'}}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* Hero Content (relative z-10 so it never overflows or overlaps sections below) */}
      <div className="relative z-10 flex flex-col justify-center gap-5 px-10 xl:px-16 py-20 max-w-3xl">
        <div>
          <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs px-3.5 py-1.5 rounded-full mb-4 uppercase tracking-wider font-semibold">
            9arrini • قَرّيني — Matkhamemch, l9a el prof elli yse3dek!
          </span>
          <h1 className="text-5xl xl:text-7xl font-light text-white leading-tight">
            Our expert tutors <br />
            <span className="font-semibold text-emerald-400">9arrini</span> w tfawwa9!
          </h1>
          <p className="text-white/85 text-lg mt-3 font-light max-w-xl">
            E5tar el prof elli ywelemk, 7adher drousek, w jib note behya bkol souhoula.
          </p>
        </div>

        <div className="max-w-2xl">
          <form
            onSubmit={e => {
              e.preventDefault();
              window.location.href = '/explore';
            }}
            className="relative"
          >
            <input
              type="text"
              placeholder="Lawwej 3la ay subject, tutor, walla cours (Math, Python, Anglais...)..."
              className="text-gray-800 font-roboto text-[16px] rounded-2xl pl-5 pr-14 py-4 outline-none bg-white shadow-2xl relative w-full"
            />
            <button
              type="submit"
              className="absolute flex items-center justify-center right-1.5 top-1.5 w-[46px] h-[46px] rounded-xl text-white cursor-pointer bg-emerald-600 hover:bg-emerald-700 transition-all"
            >
              <Search size={20} />
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          {[
            '📐 Math & Analyse',
            '💻 Python & Coding',
            '🗣️ Anglais & Français',
            '🎯 Bac & Concours Prep',
          ].map(label => (
            <div
              key={label}
              onClick={() => (window.location.href = '/explore')}
              className="flex gap-2 px-3.5 py-1.5 rounded-full border text-white items-center justify-center cursor-pointer hover:bg-white/20 transition-all text-xs backdrop-blur-xs"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                borderColor: 'rgba(255,255,255,0.25)',
              }}
            >
              <span>{label}</span>
              <ArrowRight size={14} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default VideoSection;
