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

      <div className="absolute top-48 left-10 flex flex-col gap-4">
        <div>
          <p className="text-7xl font-light text-white">
            Our freelancers <br />
            will take it from here
          </p>
        </div>
        <br />
        <div>
          <div className="relative">
            <input
              type="text"
              placeholder="search for any services....."
              className="text-gray-600 font-roboto text-[17px] rounded-2xl pl-4 pr-10 py-4 outline-none bg-white relative w-full"
            />
            <div
              className="absolute flex items-center justify-center right-1 top-1 w-[50px] h-[50px] rounded-2xl text-white"
              style={{backgroundColor: '#222325'}}
            >
              <Search size={20} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div
            className="flex gap-2 p-2 rounded-md border w-auto text-white items-center justify-center"
            style={{backgroundColor: 'rgba(249, 250, 251, 0.1)', borderColor: '#d1d5db'}}
          >
            <button className="font-light text-[15px]">website development</button>
            <ArrowRight size={20} />
          </div>
          <div
            className="flex gap-2 p-2 rounded-md border w-auto text-white items-center justify-center"
            style={{backgroundColor: 'rgba(249, 250, 251, 0.1)', borderColor: '#d1d5db'}}
          >
            <button className="font-light text-[15px]">logo design</button>
            <ArrowRight size={20} />
          </div>
          <div
            className="flex gap-2 p-2 rounded-md border w-auto text-white items-center justify-center"
            style={{backgroundColor: 'rgba(249, 250, 251, 0.1)', borderColor: '#d1d5db'}}
          >
            <button className="font-light text-[15px]">video editing</button>
            <ArrowRight size={20} />
          </div>
          <div
            className="flex gap-2 p-2 rounded-md border w-auto text-white items-center justify-center"
            style={{backgroundColor: 'rgba(249, 250, 251, 0.1)', borderColor: '#d1d5db'}}
          >
            <button className="font-light text-[15px]">architecture & interior design</button>
            <ArrowRight size={20} />
          </div>
        </div>
      </div>
      <div className="absolute left-10 bottom-5 flex gap-14">
        <p className="text-[15px] font-normal text-white">Trusted By: </p>
        <Image src={metaIcon} alt="meta" width={50} height={30} />
        <Image src={googleIcon} alt="google" width={50} height={30} />
        <Image src={netflixIcon} alt="netflix" width={50} height={30} />
        <Image src={pgIcon} alt="pg" width={50} height={30} />
        <Image src={paypalIcon} alt="paypal" width={50} height={30} />
        <Image src={pioneerIcon} alt="pioneer" width={50} height={30} />
      </div>
    </div>
  );
}

export default VideoSection;
