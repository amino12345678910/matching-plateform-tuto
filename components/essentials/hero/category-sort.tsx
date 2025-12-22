'use client';

import Image from 'next/image';

import {
  aiserivce,
  business,
  consulting,
  digital,
  graphics,
  music,
  programming,
  video,
  writing,
} from '@/lib/assets';
import {useState} from 'react';
import {ArrowDown} from 'lucide-react';

function CategorySortSection() {
  const [showAll, setShowAll] = useState(false);

  const categories = [
    {
      title: 'Programming & Tech',
      icon: <Image src={programming} width={30} height={30} alt="Programming" />,
    },
    {
      title: 'Graphics & Design',
      icon: <Image src={graphics} width={30} height={30} alt="Graphics Design" />,
    },
    {
      title: 'Digital Marketing',
      icon: <Image src={digital} width={30} height={30} alt="Digital Marketing" />,
    },
    {
      title: 'Writing & Translation',
      icon: <Image src={writing} width={30} height={30} alt="Writing Translation" />,
    },
    {
      title: 'Video & Animation',
      icon: <Image src={video} width={30} height={30} alt="Video Animation" />,
    },
    {
      title: 'AI Services',
      icon: <Image src={aiserivce} width={30} height={30} alt="AI Services" />,
    },
    {
      title: 'Music & Audio',
      icon: <Image src={music} width={30} height={30} alt="Music Audio" />,
    },
    {
      title: 'Business',
      icon: <Image src={business} width={30} height={30} alt="Business" />,
    },
    {
      title: 'Consulting',
      icon: <Image src={consulting} width={30} height={30} alt="Consulting" />,
    },
  ];

  const visibleItems = showAll ? categories : categories.slice(0, 6);

  return (
    <div className="w-full py-6">
      <div className="hidden lg:flex gap-4 overflow-x-auto scrollbar-hide">
        {categories.map((item, idx) => (
          <div
            key={idx}
            className="w-[120px] h-[120px] flex-shrink-0 bg-white rounded-2xl shadow p-4 overflow-clip border transition-all duration-200"
            style={{
              borderColor: '#e5e7eb',
              background:
                'radial-gradient(circle at center, rgba(34, 197, 94, 0.35) 10%, white 100%)',
            }}
          >
            <div className="flex flex-col gap-2">
              <div>{item.icon}</div>
              <div className="font-semibold text-[12px]" style={{color: '#1f2937'}}>
                {item.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 lg:hidden">
        {visibleItems.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2 items-center">
            <div
              className="w-[120px] h-[120px] flex items-center justify-center bg-white rounded-2xl shadow p-4 overflow-clip border"
              style={{borderColor: '#e5e7eb'}}
            >
              <div className="font-semibold">{item.icon}</div>
            </div>
            <div className="font-semibold text-[12px]" style={{color: '#1f2937'}}>
              {item.title}
            </div>
          </div>
        ))}
      </div>

      {!showAll && (
        <div className="lg:hidden mt-4 text-center">
          <div
            className="flex justify-center items-center gap-2 pt-2"
            style={{borderTop: '2px solid #d1d5db'}}
          >
            <button
              onClick={() => setShowAll(true)}
              className="text-sm font-semibold"
              style={{color: '#1f2937'}}
            >
              View 3 More
            </button>
            <ArrowDown size={16} />
          </div>
        </div>
      )}
    </div>
  );
}

export default CategorySortSection;
