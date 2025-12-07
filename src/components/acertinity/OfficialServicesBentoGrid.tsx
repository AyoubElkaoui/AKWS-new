import React from "react";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";

const OfficialServicesBentoGrid = () => {
  const services = [
    {
      title: 'Website bouwen',
      description: 'We ontwerpen en bouwen een snelle website die jouw diensten helder uitlegt en makkelijk contact mogelijk maakt.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
    },
    {
      title: 'Online marketing',
      description: 'We zorgen dat mensen je vinden in Google en via social media. Jij ziet precies wat het oplevert.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      ),
    },
    {
      title: 'Technische zorgen weg',
      description: 'Wij regelen updates, beveiliging en hosting. Storingen of vragen? Je belt of appt en we lossen het op.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        </svg>
      ),
    },
  ];

  return (
    <section id="services" className="services-new-section py-20 bg-black">
      <div className="services-new-section__shell container mx-auto px-4">
        <div className="services-new-section__intro mb-12" data-reveal>
          <span className="services-new-section__eyebrow">Wat we doen</span>
          <h2 className="text-4xl font-bold text-white mb-4">Alles onder één dak.<br />Van website tot nieuwe klanten.</h2>
          <p className="text-gray-300">
            Geen lange marketingverhalen. We vertalen jouw dienstverlening naar een website die werkt en marketing die oplevert.
          </p>
        </div>

        <BentoGrid className="max-w-4xl mx-auto">
          {services.map((service, index) => (
            <BentoGridItem
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
              className={`${index === 0 ? "md:col-span-2" : ""} bg-gray-900 border-gray-700 hover:bg-gray-800`}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
};

export default OfficialServicesBentoGrid;