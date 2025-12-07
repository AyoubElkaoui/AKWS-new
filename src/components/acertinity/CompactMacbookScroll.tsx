import React from "react";
import { MacbookScroll } from "../ui/macbook-scroll";

const CompactMacbookScroll = ({ src, title }: { src?: string; title?: string }) => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MacbookScroll
        title={title || ""}
        src={src}
        showGradient={false}
      />
    </div>
  );
};

export default CompactMacbookScroll;