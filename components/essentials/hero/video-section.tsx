'use client';
import {ArrowRight, Pause, Play, Search} from 'lucide-react';
import Image from 'next/image';
import {useEffect, useRef, useState} from 'react';

import {googleIcon, metaIcon, netflixIcon, paypalIcon, pgIcon, pioneerIcon} from '@/lib/assets';

function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
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
    <div className="hidden lg:block relative">
      <video
        ref={videoRef}
        src="/assets/DesktopHeader.mp4"
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
      />
      <button
        onClick={toggleVideo}
        className="absolute bottom-4 right-4 rounded-full p-3 shadow-lg transition"
        style={{backgroundColor: '#4b5563', color: 'white'}}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <div className="absolute top-44 left-10 flex flex-col gap-4 max-w-2xl">
        <div>
          <span className="inline-block bg-primary/20 text-emerald-300 border border-emerald-400/40 text-xs px-3 py-1 rounded-full mb-3 uppercase tracking-wider font-medium">
            9arrini • قَرّيني — Matkhamemch, l9a el prof elli yse3dek!
          </span>
          <p className="text-5xl lg:text-7xl font-light text-white leading-tight">
            Our expert tutors <br />
            <span className="font-semibold text-emerald-400">9arrini</span> w tfawwa9!
          </p>
          <p className="text-white/80 text-lg mt-2 font-light">
            E5tar el prof elli ywelemk, 7adher drousek, w jib note behya bkol souhoula.
          </p>
        </div>
        <div>
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
              className="text-gray-700 font-roboto text-[16px] rounded-2xl pl-4 pr-12 py-4 outline-none bg-white shadow-xl relative w-full"
            />
            <button
              type="submit"
              className="absolute flex items-center justify-center right-1.5 top-1.5 w-[46px] h-[46px] rounded-xl text-white cursor-pointer bg-primary hover:bg-primary/90 transition-all"
            >
              <Search size={20} />
            </button>
          </form>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <div
            onClick={() => (window.location.href = '/explore')}
            className="flex gap-2 px-3 py-1.5 rounded-full border text-white items-center justify-center cursor-pointer hover:bg-white/20 transition-all text-xs"
            style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255,255,255,0.2)'}}
          >
            <span>📐 Math & Analyse</span>
            <ArrowRight size={14} />
          </div>
          <div
            onClick={() => (window.location.href = '/explore')}
            className="flex gap-2 px-3 py-1.5 rounded-full border text-white items-center justify-center cursor-pointer hover:bg-white/20 transition-all text-xs"
            style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255,255,255,0.2)'}}
          >
            <span>💻 Python & Coding</span>
            <ArrowRight size={14} />
          </div>
          <div
            onClick={() => (window.location.href = '/explore')}
            className="flex gap-2 px-3 py-1.5 rounded-full border text-white items-center justify-center cursor-pointer hover:bg-white/20 transition-all text-xs"
            style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255,255,255,0.2)'}}
          >
            <span>🗣️ Anglais & Français</span>
            <ArrowRight size={14} />
          </div>
          <div
            onClick={() => (window.location.href = '/explore')}
            className="flex gap-2 px-3 py-1.5 rounded-full border text-white items-center justify-center cursor-pointer hover:bg-white/20 transition-all text-xs"
            style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255,255,255,0.2)'}}
          >
            <span>🎯 Bac & Concours Prep</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoSection;
