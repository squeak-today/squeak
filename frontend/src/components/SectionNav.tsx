import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SectionNavProps {
  className?: string;
  route: string;
  sections: Section[];
}

interface Section {
  label: string;
  href: string;
}

const SectionNav: React.FC<SectionNavProps> = ({ className, route, sections }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = (section: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
    
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (location.pathname !== route) {
      navigate({
        pathname: route,
        search: `?section=${section}`
      });
    }
  };

  const tabStyle = "border-none font-secondary bg-white px-4 py-2 rounded-md hover:bg-selected transition-all duration-200 text-base";
  const params = new URLSearchParams(location.search);
  const currentSection = params.get('section');

  return (
    <div className={`hidden md:flex justify-center gap-6 mt-0 pt-0 py-2 mb-8 sticky top-0 bg-white z-10 border-b border-border font-secondary ${className || ''}`}>
      {sections.map((section) => (
        <button 
          key={section.label}
          onClick={() => handleNavigation(section.href)}
          className={`${tabStyle} ${currentSection === section.href ? 'bg-selected' : ''}`}
        >
          {section.label}
        </button>
      ))} 
    </div>
  );
};

export default SectionNav; 