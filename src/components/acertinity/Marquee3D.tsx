import React from "react";

const InfiniteMovingCards = ({
  items,
  direction,
  speed,
}: {
  items: string[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
}) => {
  const directionValue = direction === "right" ? "forwards" : "reverse";
  const speedValue = speed === "fast" ? 20 : speed === "slow" ? 80 : 40;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 py-12">
      <div
        className="flex animate-marquee"
        style={{
          animationDirection: directionValue,
          animationDuration: `${speedValue}s`,
        }}
      >
        {items.concat(items).map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 mx-8 text-white text-2xl font-bold transform hover:scale-110 transition-transform duration-300"
            style={{
              transform: `rotateY(${index * 5}deg)`,
              textShadow: '0 0 10px rgba(255,255,255,0.5)',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

const Marquee3D = () => {
  const items = [
    'Snelle Websites',
    'SEO Optimalisatie',
    'E-commerce Solutions',
    'Lead Generation',
    'Mobile First Design',
    'Performance Excellence',
  ];

  return (
    <div className="h-64 w-full">
      <InfiniteMovingCards
        items={items}
        direction="right"
        speed="slow"
      />
    </div>
  );
};

export default Marquee3D;