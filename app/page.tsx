import Image from 'next/image';
import {BadgeCheck, ArrowLeft, ArrowRight, Search} from 'lucide-react';
import {catogary, happy, matching, quick} from '@/lib/assets';
import PopularService from '@/components/essentials/hero/popular-service';
import {Navbar} from '@/components/essentials/Navbar';
import {Footer} from '@/components/footer/footer-2';
import VideoSection from '../components/essentials/hero/video-section';
import GetStartedButton from '../components/essentials/hero/get-started-button';
import CategorySortSection from '../components/essentials/hero/category-sort';

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <div
        className="lg:hidden flex flex-col justify-center px-4 py-8"
        style={{
          background: 'linear-gradient(to bottom, #052e16, #166534)',
        }}
      >
        <div className="text-center mb-4">
          <span className="inline-block bg-white/20 text-emerald-200 text-xs px-3 py-1 rounded-full mb-2">
            9arrini • قَرّيني
          </span>
          <h1 className="text-2xl font-semibold text-white">
            Trouvez facilement le professeur idéal pour réussir !
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Les meilleurs professeurs et tuteurs vérifiés dans toute la Tunisie
          </p>
        </div>
        <div className="flex justify-center items-center">
          <form action="/explore" method="GET" className="relative w-full max-w-md">
            <input
              type="text"
              name="q"
              placeholder="Ex: Mathématiques, Python, Anglais, Bac..."
              className="text-gray-700 font-roboto text-[15px] rounded-xl pl-4 pr-10 py-3 outline-none bg-white relative w-full shadow-md"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 p-2 rounded-lg text-white cursor-pointer"
              style={{backgroundColor: '#166534'}}
            >
              <Search size={18} />
            </button>
          </form>
        </div>
      </div>
      <VideoSection />
      {/* Main Content */}
      <main className="flex flex-col gap-10 px-8 py-10">
        <CategorySortSection />

        {/* Popular Subjects & Tutoring Sessions */}
        <div className="flex flex-col gap-10 mt-5">
          <h1 className="font-normal text-3xl lg:text-5xl" style={{color: '#404145'}}>
            Matières de Soutien Populaires
          </h1>
          <div className="relative">
            <PopularService nextBtn={'.next-Btn'} prevBtn={'.prev-Btn'} />
            <button
              className="prev-Btn absolute top-[40%] -left-5 z-10 flex items-center justify-center transform w-12 h-12 rounded-full font-medium bg-white shadow-md transition duration-300 ease-in-out"
              style={{color: 'rgba(0, 0, 0, 0.5)'}}
            >
              <ArrowLeft size={20} />
            </button>
            <button
              className="next-Btn absolute top-[40%] -right-5 z-10 flex items-center justify-center transform w-12 h-12 rounded-full font-medium bg-white shadow-md transition duration-300 ease-in-out"
              style={{color: 'rgba(0, 0, 0, 0.5)'}}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* 9arrini Plus Section */}
        <div className="relative flex flex-col lg:flex-row-reverse gap-4 rounded-lg bg-black p-8">
          <div className="flex-1 overflow-hidden rounded-xl bg-emerald-950/40 min-h-[260px]">
            <video
              src="/assets/gemini_generated_video_f053b079.mp4"
              poster="/assets/tutoring-academy.jpg"
              preload="metadata"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="flex flex-col flex-1 gap-4 text-white lg:p-4">
            <h1 className="font-bold text-2xl lg:text-4xl">
              9arrini <span className="font-light text-emerald-400">Plus+</span>
            </h1>
            <h2 className="font-light text-3xl font-aldrich lg:text-6xl">
              Les meilleurs cours. Les meilleurs professeurs.
            </h2>
            <p className="font-normal text-[15px] z-10 text-white/90">
              Un chapitre difficile ? Des examens qui approchent ? 9arrini vous connecte avec les meilleurs professeurs et mentors qui expliquent de manière claire et méthodique. Réservez votre séance individuelle en direct et réussissez vos études !
            </p>
            <div className="flex items-center justify-center lg:justify-start">
              <GetStartedButton />
            </div>
          </div>
          <div
            className="absolute bottom-0 left-0 h-[500px] w-full rounded-lg pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at center, rgba(34, 197, 94, 0.3), transparent 70%)',
            }}
          ></div>
        </div>

        {/* Academy Section */}
        <div
          className="grid lg:grid-cols-2 gap-4 p-4 rounded-lg"
          style={{backgroundColor: '#E8FAF4'}}
        >
          <div className="flex flex-col gap-8 py-8 px-12">
            <div className="font-extrabold text-3xl">
              9arrini <span className="font-normal text-emerald-700">Academy.</span>
            </div>
            <div className="font-normal text-2xl leading-normal lg:text-5xl lg:leading-16">
              La solution complète pour tous les élèves et étudiants qui visent l’excellence
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                {
                  title: 'Professeurs vérifiés et expérimentés',
                  desc: 'Des enseignants et ingénieurs qualifiés pour vous accompagner dans chaque matière.',
                },
                {
                  title: 'Garantie de compréhension et de qualité',
                  desc: 'Des séances 100% interactives en direct avec un professeur dédié à votre progression.',
                },
                {
                  title: 'Programme sur mesure',
                  desc: 'Suivez vos progrès séance après séance avec exercices corrigés et révisions.',
                },
                {
                  title: 'Tarifs accessibles en Dinars',
                  desc: 'Des formules adaptées à tous les budgets (à la séance ou en pack de cours).',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <BadgeCheck size={20} style={{color: '#166534'}} />
                  <p className="font-semibold" style={{color: '#0c0a09'}}>
                    {item.title}
                  </p>
                  <p className="text-sm font-normal" style={{color: '#1c1917'}}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center p-4">
            <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-emerald-200">
              <Image
                src="/assets/tutoring-academy.jpg"
                alt="9arrini Academy Tutoring"
                className="w-full h-full object-cover rounded-2xl hover:scale-105 transition-transform duration-500"
                width={800}
                height={600}
                priority
              />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 shadow">
                🎓 Cours particuliers 1-on-1 & Groupes avec les meilleurs professeurs
              </div>
            </div>
          </div>
        </div>

        {/* Success Story */}
        <div className="flex flex-col gap-6">
          <h1 className="font-normal text-4xl" style={{color: '#111827'}}>
            Comment 9arrini transforme votre façon d’apprendre
          </h1>
          <p className="font-light text-sm" style={{color: '#4b5563'}}>
            Des centaines d’élèves et d’étudiants utilisent 9arrini pour améliorer leurs notes et maîtriser de nouvelles compétences.
          </p>
          <video
            src="/assets/gemini_generated_video_68919dca.mp4"
            poster="/assets/tutoring-academy.jpg"
            preload="metadata"
            muted
            autoPlay
            loop
            controls
            playsInline
            className="w-full h-full max-h-[600px] min-h-[300px] bg-slate-900 object-cover rounded-2xl shadow-xl"
          ></video>
        </div>

        {/* Features Section */}
        <div className="flex flex-col gap-8">
          <div className="text-4xl font-normal" style={{color: '#1f2937'}}>
            Tout commence par un bon professeur qui vous comprend
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[
              {
                icon: catogary,
                text: 'Les meilleurs professeurs dans plus de 50 matières et spécialités',
              },
              {
                icon: matching,
                text: 'Mise en relation simple et rapide avec le professeur adapté à votre niveau',
              },
              {
                icon: quick,
                text: 'Des cours à votre rythme et selon votre budget en Dinars (DT)',
              },
              {
                icon: happy,
                text: 'Progressez sereinement avec un suivi personnalisé dès la première séance',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                <div>
                  <Image src={item.icon} alt="" width={50} height={50} />
                </div>
                <p className="font-normal text-[16px]" style={{color: '#4b5563'}}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
