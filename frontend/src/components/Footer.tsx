import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface FooterProps {
  className?: string;
}

interface Item {
    label: string;
    url: string;
    type: 'local' | 'external';
}

interface SectionProps {
    title: string;
    items: Item[];
}

const Section: React.FC<SectionProps> = ({ title, items }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col">
      <h3 className="font-primary text-lg font-semibold mb-[var(--spacing-sm)]">
        {title}
      </h3>
      {items.map((item) => (
        <p onClick={() => {
          if (item.type === 'local') {
            navigate(item.url);
          } else {
            window.open(item.url, '_blank');
          }
        }} className="cursor-pointer text-[var(--color-text-secondary)] no-underline mb-0 text-(--font-size-sm) transition-colors duration-200 hover:text-[var(--color-text-primary)]">
          {item.label}
        </p>
      ))}
    </div>
  )
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={`w-full bg-[var(--color-background)] border-t border-[var(--color-border)] p-[var(--spacing-lg)_var(--spacing-md)] font-[var(--font-secondary)] mt-[var(--spacing-xl)] ${className || ''}`}>
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[var(--spacing-lg)]">
        <Section title="About Us" items={[
          {
            label: 'Twitter/X',
            url: 'https://x.com/learnsqueak',
            type: 'external'
          },
          {
            label: 'Instagram',
            url: 'https://www.instagram.com/squeak.today',
            type: 'external'
          },
          {
            label: 'LinkedIn',
            url: 'https://www.linkedin.com/company/learn-squeak',
            type: 'external'
          },
          {
            label: 'Contact Us',
            url: '/contact-support.html',
            type: 'external'
          }
        ]} />

      
      
      </div>
      <div className="font-primary text-center pt-[var(--spacing-lg)] mt-[var(--spacing-lg)] border-t border-[var(--color-border)] text-[var(--color-text-secondary)] text-[var(--font-size-sm)]">
        © {new Date().getFullYear()} Squeak. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer; 