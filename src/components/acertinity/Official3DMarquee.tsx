import React from "react";
import { ThreeDMarquee } from "../ui/3d-marquee";

const Official3DMarquee = ({ outcomes }: { outcomes: any[] }) => {
  const items = outcomes.map((o) => ({ title: o.title, subtitle: o.description, tags: o.tags }));
  return (
  <section className="py-12 bg-gray-900">
      <div className="container mx-auto px-4">
        <ThreeDMarquee items={items} className="mx-auto max-w-full" />
      </div>
    </section>
  );
};

export default Official3DMarquee;
