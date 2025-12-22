// component2/components/PopularService.tsx
'use client';

import React, {useCallback, useEffect, useState} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import Image from 'next/image';
import webdev from '@/public/assets/website-development.webp';
import logodes from '@/public/assets/logo-design.webp';
import SEO from '@/public/assets/seo.webp';
import architecture from '@/public/assets/architecture-design.webp';
import voice from '@/public/assets/voice-over.webp';
import social from '@/public/assets/social-media-marketing.webp';
import ugc from '@/public/assets/UGC-video-img.webp';
import software from '@/public/assets/software-development.webp';
import science from '@/public/assets/data-science.webp';
import product from '@/public/assets/product-photography.webp';
import ecommerce from '@/public/assets/e-commerce.webp';
import videoedit from '@/public/assets/video-editing.webp';

interface PopularServiceProps {
  nextBtn?: string;
  prevBtn?: string;
}

const PopularService = ({nextBtn, prevBtn}: PopularServiceProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 1024px)': {slidesToScroll: 6},
      '(min-width: 768px)': {slidesToScroll: 4},
      '(min-width: 640px)': {slidesToScroll: 3},
      '(max-width: 639px)': {slidesToScroll: 1.6},
    },
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const data = [
    {
      title: 'Web Development',
      icon: (
        <Image src={webdev} alt="Web Development" className="rounded-lg" width={160} height={130} />
      ),
    },
    {
      title: 'Logo Design',
      icon: (
        <Image src={logodes} alt="Logo Design" className="rounded-lg" width={160} height={130} />
      ),
    },
    {
      title: 'SEO',
      icon: <Image src={SEO} alt="SEO" width={160} height={130} />,
    },
    {
      title: 'Architecture & Interior Design',
      icon: <Image src={architecture} alt="Architecture Design" width={160} height={130} />,
    },
    {
      title: 'Voice Over',
      icon: <Image src={voice} alt="Voice Over" width={160} height={130} />,
    },
    {
      title: 'Social media Marketing',
      icon: <Image src={social} alt="Social Media Marketing" width={160} height={130} />,
    },
    {
      title: 'UGC Videos',
      icon: <Image src={ugc} alt="UGC Videos" width={160} height={130} />,
    },
    {
      title: 'Software Development',
      icon: <Image src={software} alt="Software Development" width={160} height={130} />,
    },
    {
      title: 'Data Science & ML',
      icon: <Image src={science} alt="Data Science" width={160} height={130} />,
    },
    {
      title: 'Product Photography',
      icon: <Image src={product} alt="Product Photography" width={160} height={130} />,
    },
    {
      title: 'E-Commerce marketing',
      icon: <Image src={ecommerce} alt="E-commerce Marketing" width={160} height={130} />,
    },
    {
      title: 'Video Editing',
      icon: <Image src={videoedit} alt="Video Editing" width={160} height={130} />,
    },
  ];

  return (
    <div className="w-full relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {data.map((item, idx) => (
            <div key={idx} className="flex-[0_0_180px] min-w-0 pl-4 first:pl-0">
              <div
                className="relative flex flex-col justify-between p-2 rounded-2xl w-full min-h-[230px]"
                style={{backgroundColor: '#003912'}}
              >
                <p className="font-bold text-lg p-2 text-white">{item.title}</p>
                <div className="mt-2">{item.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="absolute top-1/2 -left-5 transform -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 rounded-full font-medium bg-white shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        style={{color: 'rgba(0, 0, 0, 0.5)'}}
        onClick={scrollPrev}
        disabled={!prevBtnEnabled}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        className="absolute top-1/2 -right-5 transform -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 rounded-full font-medium bg-white shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        style={{color: 'rgba(0, 0, 0, 0.5)'}}
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default PopularService;
