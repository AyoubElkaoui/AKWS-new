import React from "react";
import { motion } from "framer-motion";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={`grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ${className}`}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={`row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4 ${className}`}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        {icon}
        <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
          {title}
        </div>
        <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
          {description}
        </div>
      </div>
    </div>
  );
};

const FeatureSection3D = ({ outcomes }: { outcomes: any[] }) => {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-center text-white mb-12"
        >
          Onze Projecten in 3D
        </motion.h2>
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
              className={index % 3 === 0 ? "md:col-span-2" : ""}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
};

export default FeatureSection3D;