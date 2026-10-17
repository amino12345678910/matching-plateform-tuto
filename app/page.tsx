import Image from 'next/image';
import {BadgeCheck, ArrowLeft, ArrowRight, Search} from 'lucide-react';
import {catogary, fiverPro, happy, matching, quick} from '@/lib/assets';
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
            Matkhamemch, l9a el prof elli yse3dek!
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Les meilleurs profs w tlamdha f tounes bkolha
          </p>
        </div>
        <div className="flex justify-center items-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Jarreb Math, Python, Anglais, Bac..."
              className="text-gray-700 font-roboto text-[15px] rounded-xl pl-4 pr-10 py-3 outline-none bg-white relative w-full shadow-md"
            />
            <div
              className="absolute right-1.5 top-1.5 p-2 rounded-lg text-white"
              style={{backgroundColor: '#166534'}}
            >
              <Search size={18} />
            </div>
          </div>
        </div>
      </div>
      <VideoSection />
      {/* Main Content */}
      <main className="flex flex-col gap-10 px-8 py-10">
        <CategorySortSection />

        {/* Popular Subjects & Tutoring Sessions */}
        <div className="flex flex-col gap-10 mt-5">
          <h1 className="font-normal text-3xl lg:text-5xl" style={{color: '#404145'}}>
            Popular Tutoring Subjects
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

        {/* AI Section */}
        <div className="relative flex flex-col lg:flex-row-reverse gap-4 rounded-lg bg-black p-8">
          <div className="flex-1 overflow-hidden rounded-xl">
            <video
              src="/assets/gemini_generated_video_f053b079.mp4"
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
              Aqwa drous. A7san profs.
            </h2>
            <p className="font-normal text-[15px] z-10 text-white/90">
              Fhem s3ib? Dourousek msha3bka? Ma3andekch waqt? 9arrini tjiblk a7san les profs w el mentors 
              elli yfasroulek b tari9a sahla w claire. Réservez votre séance 1-on-1, posez vos questions, w tfawwa9 fi 9raytek!
            </p>
            <div className="flex items-center justify-center lg:justify-start">
              <GetStartedButton />
            </div>
          </div>
          <div
            className="absolute bottom-0 left-0 h-[500px] w-full rounded-lg"
            style={{
              background:
                'radial-gradient(circle at center, rgba(34, 197, 94, 0.3), transparent 70%)',
            }}
          ></div>
        </div>

        {/* Pro Section */}
        <div
          className="grid lg:grid-cols-2 gap-4 p-4 rounded-lg"
          style={{backgroundColor: '#E8FAF4'}}
        >
          <div className="flex flex-col gap-8 py-8 px-12">
            <div className="font-extrabold text-3xl">
              9arrini <span className="font-normal text-emerald-700">Academy.</span>
            </div>
            <div className="font-normal text-2xl leading-normal lg:text-5xl lg:leading-16">
              El{' '}
              <span className="font-cormorant font-bold" style={{color: '#1DBF73'}}>
                solution
              </span>{' '}
              lkol tlemidha w etudiants elli y7ebbou ynaj7ou
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                {
                  title: 'Profs vérifiés w expérimentés',
                  desc: 'Asatdha w ingénieurs kfée y3awnouk f kol sghira w kbira f drousek.',
                },
                {
                  title: 'Dhaman al fhem w el jawda',
                  desc: 'Seances 100% interactives m3a prof mrakkez m3ak wahdek.',
                },
                {
                  title: 'Barnamej 3la 9yasek',
                  desc: 'Tabba3 el progrés mte3ek seance b seance w slah el devoirs.',
                },
                {
                  title: 'As3ar bil Dinar mrigla',
                  desc: 'Tarifs fi moutanawal el jami3 (par heure walla pack drous) b soum ma39oul.',
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
                🎓 Drous 1-on-1 & Groupes m3a a7san asatdha
              </div>
            </div>
          </div>
        </div>

        {/* Success Story */}
        <div className="flex flex-col gap-6">
          <h1 className="font-normal text-4xl" style={{color: '#111827'}}>
            Kifech 9arrini tbaddel tari9et 9rayetkom
          </h1>
          <p className="font-light text-sm" style={{color: '#4b5563'}}>
            Meyat el tlamdha w el etudiants sta3mlou 9arrini bech yejbdo notes tayara w yet3almo maharat jdida.
          </p>
          <video
            src="/assets/gemini_generated_video_68919dca.mp4"
            muted
            autoPlay
            loop
            controls
            playsInline
            className="w-full h-full max-h-[600px] object-cover rounded-2xl shadow-xl"
          ></video>
        </div>

        {/* Features Section */}
        <div className="flex flex-col gap-8">
          <div className="text-4xl font-normal" style={{color: '#1f2937'}}>
            Kol chay yebdà b prof behy yefhmek
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[
              {
                icon: catogary,
                text: 'A7san el asatdha f akther men 50 matiére w takhasses',
              },
              {
                icon: matching,
                text: 'Matching sahla w rapide m3a el prof elli ywelem moustewak',
              },
              {
                icon: quick,
                text: 'Drous 3la 9ad rythm mte3ek w budget mte3ek bil Dinar',
              },
              {
                icon: happy,
                text: 'Erté7 w tfawwa9 m3a suivi personnalisé men lawwel seance',
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
