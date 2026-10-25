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
      title: 'Informatique & Programmation',
      icon: <Image src={programming} width={30} height={30} alt="Informatique & Programmation" />,
    },
    {
      title: 'Arts & Design Graphique',
      icon: <Image src={graphics} width={30} height={30} alt="Arts & Design Graphique" />,
    },
    {
      title: 'Mathématiques & Statistiques',
      icon: <Image src={digital} width={30} height={30} alt="Mathématiques & Statistiques" />,
    },
    {
      title: 'Langues & Rédaction',
      icon: <Image src={writing} width={30} height={30} alt="Langues & Rédaction" />,
    },
    {
      title: 'Physique & Sciences',
      icon: <Image src={video} width={30} height={30} alt="Physique & Sciences" />,
    },
    {
      title: 'IA & Science des Données',
      icon: <Image src={aiserivce} width={30} height={30} alt="IA & Science des Données" />,
    },
    {
      title: 'Musique & Instruments',
      icon: <Image src={music} width={30} height={30} alt="Musique & Instruments" />,
    },
    {
      title: 'Économie, Gestion & Finance',
      icon: <Image src={business} width={30} height={30} alt="Économie, Gestion & Finance" />,
    },
    {
      title: 'Préparation Bac & Concours',
      icon: <Image src={consulting} width={30} height={30} alt="Préparation Bac & Concours" />,
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
              Voir 3 de plus
            </button>
            <ArrowDown size={16} />
          </div>
        </div>
      )}
    </div>
  );
}

export default CategorySortSection;
