import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  IconCode,
  IconRocket,
  IconChartBar,
  IconDeviceMobile,
} from "@tabler/icons-react";

export default function HomeFeaturesBento() {
  const features = [
    {
      title: "Snelle websites die converteren",
      description:
        "Gebouwd met moderne tech stack. Geen WordPress bloat, alleen pure snelheid en performance die zorgt voor hogere conversies.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r border-neutral-800",
    },
    {
      title: "SEO die rankings behaalt",
      description:
        "Eerste pagina Google binnen 4-6 weken. Technische SEO, local SEO en content strategie ingebouwd.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 border-neutral-800",
    },
    {
      title: "Van strategie tot resultaat",
      description:
        "Niet alleen een mooie website, maar een digitaal systeem dat klanten binnenhaalt. Data-driven aanpak met meetbare KPIs.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r border-neutral-800",
    },
    {
      title: "Live binnen 2-4 weken",
      description:
        "Sprint-based development betekent snelle levering zonder in te leveren op kwaliteit. Start vandaag, live over een maand.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];

  return (
    <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-white">
          Snelle websites die converteren.
        </h4>

        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-gray-400 text-center font-normal">
          Van strategie tot live website. Snelheid, SEO en conversie ingebouwd
          in elke pixel. Klaar om te groeien?
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md border-neutral-800">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="max-w-5xl mx-auto text-left tracking-tight text-white text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-left mx-auto",
        "text-gray-400 text-center font-normal",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

// Speed/Performance skeleton
export const SkeletonOne = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-5 mx-auto bg-neutral-900 shadow-2xl group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2">
          {/* Performance metrics */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex flex-col">
              <span className="text-4xl font-bold text-green-500">0.4s</span>
              <span className="text-xs text-gray-400">Laadtijd</span>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-bold text-blue-500">95+</span>
              <span className="text-xs text-gray-400">PageSpeed</span>
            </div>
          </div>
          {/* Mockup of website */}
          <div className="bg-neutral-800 rounded-lg p-4 h-40 flex items-center justify-center border border-neutral-700">
            <IconRocket className="w-16 h-16 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-[#0a0b0f] via-[#0a0b0f] to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-[#0a0b0f] via-transparent to-transparent w-full pointer-events-none" />
    </div>
  );
};

// SEO Rankings skeleton
export const SkeletonTwo = () => {
  const rankings = [
    { position: "#1", keyword: "webdesign baarn" },
    { position: "#2", keyword: "website laten maken" },
    { position: "#1", keyword: "seo utrecht" },
  ];

  return (
    <div className="relative flex flex-col items-start p-8 gap-4 h-full overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <IconChartBar className="w-6 h-6 text-green-500" />
        <span className="text-sm font-semibold text-gray-300">
          Google Rankings
        </span>
      </div>

      {rankings.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.2 }}
          className="flex items-center gap-3 w-full bg-neutral-800 rounded-lg p-3 border border-neutral-700"
        >
          <span className="text-xl font-bold text-green-500">
            {item.position}
          </span>
          <span className="text-sm text-gray-400">
            {item.keyword}
          </span>
        </motion.div>
      ))}

      <div className="absolute left-0 z-[100] inset-y-0 w-20 bg-gradient-to-r from-[#0a0b0f] to-transparent h-full pointer-events-none" />
      <div className="absolute right-0 z-[100] inset-y-0 w-20 bg-gradient-to-l from-[#0a0b0f] to-transparent h-full pointer-events-none" />
    </div>
  );
};

// Strategy/Process skeleton
export const SkeletonThree = () => {
  const steps = [
    "Strategie sessie",
    "Design & UX",
    "Development",
    "SEO & Launch",
  ];

  return (
    <div className="relative flex flex-col p-8 gap-6 h-full">
      <div className="flex items-center gap-2 mb-2">
        <IconCode className="w-6 h-6 text-blue-500" />
        <span className="text-sm font-semibold text-gray-300">
          Sprint Proces
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 flex items-center justify-center"
          >
            <span className="text-blue-400 text-sm font-semibold text-center">
              {step}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-40 bg-gradient-to-t from-[#0a0b0f] to-transparent w-full pointer-events-none" />
    </div>
  );
};

// Fast delivery skeleton
export const SkeletonFour = () => {
  return (
    <div className="h-60 md:h-60 flex flex-col items-center justify-center relative bg-transparent dark:bg-transparent p-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-3xl opacity-50" />
        <IconDeviceMobile className="relative w-32 h-32 text-blue-500" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-center text-gray-700 dark:text-gray-300 font-semibold"
      >
        Mobiel-first & responsive
      </motion.p>
    </div>
  );
};
