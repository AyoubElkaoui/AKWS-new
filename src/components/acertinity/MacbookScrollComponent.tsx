"use client";

import React from "react";
import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export const MacbookScroll = ({
  src,
  showGradient,
  title,
  badge,
}: {
  src?: string[];
  showGradient?: boolean;
  title?: string | React.ReactNode;
  badge?: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={ref} className="relative h-screen flex items-center justify-center">
      <motion.div
        style={{ scale, opacity }}
        className="relative w-full max-w-4xl"
      >
        {/* MacBook Frame */}
        <div className="relative bg-gray-800 rounded-t-2xl p-2 shadow-2xl">
          <div className="bg-black rounded-lg overflow-hidden">
            {/* Screen Content */}
            <div className="relative h-96 overflow-hidden">
              <motion.div
                className="flex"
                animate={{
                  x: [0, -100 * ((src?.length ?? 1) - 1)],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {src?.map((s, index) => (
                  <img
                    key={index}
                    src={s}
                    alt={`Image ${index + 1}`}
                    className="w-full h-96 object-cover flex-shrink-0"
                  />
                ))}
              </motion.div>
            </div>
          </div>
          {/* MacBook Base */}
          <div className="w-32 h-2 bg-gray-700 mx-auto rounded-b-lg"></div>
        </div>
      </motion.div>
    </div>
  );
};

const MacbookScrollComponent = () => {
  const images = [
    '/src/assets/Images/Screenshot From 2025-11-19 18-05-54.png',
    '/src/assets/Images/Screenshot From 2025-11-19 18-06-05.png',
    '/src/assets/Images/Screenshot From 2025-11-19 18-06-15.png',
    '/src/assets/Images/Screenshot From 2025-11-19 18-06-30.png',
    '/src/assets/Images/Screenshot From 2025-11-19 18-06-44.png',
  ];

  return (
    <MacbookScroll
      title="Bekijk onze website projecten"
      src={images}
      showGradient={false}
    />
  );
};

export default MacbookScrollComponent;