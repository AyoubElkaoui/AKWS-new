import React from "react";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";

const OfficialFeatureSection3D = ({ outcomes }: { outcomes: any[] }) => {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-white mb-12">
          Onze Projecten in 3D
        </h2>
        <BentoGrid className="max-w-4xl mx-auto">
          {outcomes.map((project, index) => (
            <BentoGridItem
              key={index}
              title={project.title}
              description={project.description}
              header={
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag: string, tagIndex: number) => (
                    <span
                      key={tagIndex}
                      className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              }
              className={`${index % 3 === 0 ? "md:col-span-2" : ""} bg-gray-900 border-gray-700 hover:bg-gray-800`}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
};

export default OfficialFeatureSection3D;