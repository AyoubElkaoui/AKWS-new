import { ThreeDMarquee } from '@/components/ui/3d-marquee';
import img1 from '@/assets/Images/Screenshot From 2025-11-19 18-05-54.png';
import img2 from '@/assets/Images/Screenshot From 2025-11-19 18-06-05.png';
import img3 from '@/assets/Images/Screenshot From 2025-11-19 18-06-15.png';
import img4 from '@/assets/Images/Screenshot From 2025-11-19 18-06-30.png';
import img5 from '@/assets/Images/Screenshot From 2025-11-19 18-06-44.png';

interface Outcome {
  title: string;
  description: string;
  results: string[];
  tags: string[];
  url: string;
}

interface ThreeDMarqueeShowcaseProps {
  outcomes: Outcome[];
}

export default function ThreeDMarqueeShowcase({ outcomes }: ThreeDMarqueeShowcaseProps) {
  // Gebruik de echte project screenshots uit assets
  const baseImages = [
    img1.src,
    img2.src,
    img3.src,
    img4.src,
    img5.src,
  ];
  
  // Shuffle functie voor random volgorde
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Maak 4 verschillende shuffled sets voor random patroon
  const images = [
    ...shuffleArray(baseImages),
    ...shuffleArray(baseImages),
    ...shuffleArray(baseImages),
    ...shuffleArray(baseImages),
  ];

  return (
    <section className="relative w-screen left-[50%] right-[50%] -mx-[50vw] py-0 overflow-hidden">
      <div className="relative flex min-h-[70vh] w-screen flex-col items-center justify-center">
        {/* Massive full-coverage overlay that extends beyond section */}
        <div className="absolute -inset-20 z-10 w-[120%] h-[120%] left-[-10%]">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#0a0b0f]/90 via-[#0a0b0f]/60 to-[#0a0b0f]/90" />
          <div className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-[#0a0b0f]/95 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-[#0a0b0f]/95 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-[35%] bg-gradient-to-r from-[#0a0b0f]/85 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-[35%] bg-gradient-to-l from-[#0a0b0f]/85 to-transparent" />
        </div>

        <h2 className="relative z-20 mx-auto mb-4 max-w-5xl px-4 text-center text-3xl font-bold text-balance text-white md:text-5xl lg:text-6xl">
          Onze Projecten in{" "}
          <span className="relative z-20 inline-block text-white">
            3D
          </span>
        </h2>
        <p className="relative z-20 mx-auto mb-6 max-w-3xl px-4 text-center text-sm text-neutral-200 md:text-base lg:text-lg">
          Bekijk onze cases in een interactieve 3D showcase. 
          Elk project gebouwd met focus op snelheid, conversie en resultaten.
        </p>

        <div className="relative z-20 flex flex-wrap items-center justify-center gap-4 pt-2 mb-8">
          <a 
            href="/contact" 
            className="inline-flex items-center gap-3 rounded-xl border border-indigo-500/40 bg-gradient-to-br from-indigo-600 to-indigo-700 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:border-indigo-500/60 hover:from-indigo-600 hover:to-indigo-800 hover:shadow-indigo-500/35 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0a0b0f]"
          >
            Start je project
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-1">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a 
            href="/diensten" 
            className="inline-flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black"
          >
            Bekijk diensten
          </a>
        </div>

        <ThreeDMarquee
          className="pointer-events-none absolute top-0 left-0 right-0 bottom-0 h-full w-full"
          images={images}
        />
      </div>
    </section>
  );
}
