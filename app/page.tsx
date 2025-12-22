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
        className="lg:hidden flex flex-col justify-center pb-8"
        style={{
          background: 'linear-gradient(to bottom, #052e16, #166534)',
        }}
      >
        <h1 className="text-3xl font-light font-poppins text-white text-center">
          Our freelancers
          <br />
          will take it from here
        </h1>
        <br />
        <div className="flex justify-center items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="try building mobile app"
              className="text-gray-600 font-roboto text-[17px] rounded-lg pl-4 pr-10 py-2 outline-none bg-white relative"
            />
            <div
              className="absolute right-1 top-1 p-2 rounded-lg text-white"
              style={{backgroundColor: '#166534'}}
            >
              <Search size={20} />
            </div>
          </div>
        </div>
      </div>
      <VideoSection />
      {/* Main Content */}
      <main className="flex flex-col gap-10 px-8 py-10">
        <CategorySortSection />

        {/* Popular Services */}
        <div className="flex flex-col gap-10 mt-5">
          <h1 className="font-normal text-3xl lg:text-5xl" style={{color: '#404145'}}>
            Popular Services
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
          <div className="flex-1">
            {/* Note: Replace with your video source */}
            <video src="/assets/Image model.mp4" autoPlay loop muted className="w-full h-full" />
          </div>
          <div className="flex flex-col flex-1 gap-4 text-white lg:p-4">
            <h1 className="font-bold text-2xl lg:text-4xl">
              Aiverr <span className="font-light">Go</span>
            </h1>
            <h2 className="font-light text-3xl font-aldrich lg:text-6xl">
              Instant results. Top talent.
            </h2>
            <p className="font-normal text-[15px] z-10">
              Get what you need faster from freelancers who trained their own personal AI Creation
              Models. Now you can browse, prompt, and generate instantly. And if you need a tweak or
              change, the freelancer is always there to help you perfect it.
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
              Aiverr <span className="font-normal">Pro.</span>
            </div>
            <div className="font-normal text-2xl leading-normal lg:text-5xl lg:leading-16">
              The{' '}
              <span className="font-cormorant font-bold" style={{color: '#1DBF73'}}>
                premium
              </span>{' '}
              freelance solution for businesses
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                {
                  title: 'Dedicated hiring experts',
                  desc: "Count on an account manager to find you the right talent and see to your project's every need.",
                },
                {
                  title: 'Satisfaction guarantee',
                  desc: 'Order confidently, with guaranteed refunds for less-than-satisfactory deliveries.',
                },
                {
                  title: 'Advanced management tools',
                  desc: 'Advanced management tools.',
                },
                {
                  title: 'Flexible payment models',
                  desc: 'Pay per project or opt for hourly rates to facilitate longer-term collaboration.',
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
          <div>
            <Image
              src={fiverPro}
              alt="Fiverr Pro"
              className="w-full h-full object-contain"
              width={600}
              height={400}
            />
          </div>
        </div>

        {/* Success Story */}
        <div className="flex flex-col gap-6">
          <h1 className="font-normal text-4xl" style={{color: '#111827'}}>
            What success on Aiverr looks like
          </h1>
          <p className="font-light text-sm" style={{color: '#4b5563'}}>
            Vontélle Eyewear turns to Aiverr freelancers to bring their vision to life.
          </p>
          {/* Note: Replace with your video source */}
          <video
            src="/assets/Vontelle Cutdown- Breakthrough V5.mp4"
            muted
            autoPlay
            loop
            controls
            className="w-full h-full rounded-2xl"
          ></video>
        </div>

        {/* Features Section */}
        <div className="flex flex-col gap-8">
          <div className="text-4xl font-normal" style={{color: '#1f2937'}}>
            Make it all happen with freelancers
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[
              {
                icon: catogary,
                text: 'Access a pool of top talent across 700 categories',
              },
              {
                icon: matching,
                text: 'Enjoy a simple, easy-to-use matching experience',
              },
              {
                icon: quick,
                text: 'Get quality work done quickly and within budget',
              },
              {
                icon: happy,
                text: "Only pay when you're happy",
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
