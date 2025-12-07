import React from "react";
import { InfiniteMovingCards } from "../ui/infinite-moving-cards";

const OfficialMarquee3D = ({ items }: { items?: { quote: string; name?: string; title?: string }[] }) => {
  // Accept items prop (array of objects) or keep demo fallback
  const defaultItems = [
    { quote: "Snelle Websites", name: "Performance", title: "Core Service" },
    { quote: "SEO Optimalisatie", name: "Visibility", title: "Marketing" },
    { quote: "E-commerce Solutions", name: "Commerce", title: "Business" },
    { quote: "Lead Generation", name: "Growth", title: "Results" },
    { quote: "Mobile First Design", name: "UX/UI", title: "Design" },
    { quote: "Performance Excellence", name: "Speed", title: "Technical" },
  ];
  const content = items && items.length ? items : defaultItems;

  return (
    <div className="h-64 w-full bg-gradient-to-r from-transparent via-neutral-900/30 to-transparent py-12">
      <InfiniteMovingCards
        items={content}
        direction="right"
        speed="slow"
      />
    </div>
  );
};

export default OfficialMarquee3D;