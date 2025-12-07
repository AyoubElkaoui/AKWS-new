import React from "react";
import { useId } from "react";

const OfficialFeaturesSection = ({ outcomes }: { outcomes: any[] }) => {
  // Transform outcomes to grid format
  const grid = outcomes.map((project, index) => ({
    title: project.title,
    description: project.description,
    tags: project.tags,
  }));

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Onze Projecten in Actie
          </h2>
          <p className="text-gray-300 text-lg">
            Van concept tot live website - resultaten die spreken
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {grid.map((feature, index) => (
            <div
              key={feature.title}
              className="relative bg-gradient-to-b from-gray-900 to-gray-950 p-6 rounded-3xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300"
            >
              <Grid size={20} />
              <div className="flex flex-wrap gap-2 mb-4">
                {feature.tags.map((tag: string, tagIndex: number) => (
                  <span
                    key={tagIndex}
                    className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-base font-bold text-white relative z-20 mb-3">
                {feature.title}
              </p>
              <p className="text-gray-400 mt-2 text-sm font-normal relative z-20">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Grid = ({
  pattern,
  size,
}: {
  pattern?: number[][];
  size?: number;
}) => {
  const p = pattern ?? [
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
  ];
  return (
    <div className="pointer-events-none absolute left-1/2 top-0 -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/20 to-zinc-900/20 opacity-100">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full mix-blend-overlay fill-white/5 stroke-white/5"
        />
      </div>
    </div>
  );
};

export function GridPattern({ width, height, x, y, squares, ...props }: any) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]: any) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
};

export default OfficialFeaturesSection;