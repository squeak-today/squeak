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
    <div className="flex flex-col px-8 py-2 whitespace-nowrap">
      <h3 className="font-primary text-lg font-semibold mb-[var(--spacing-sm)]">
        {title}
      </h3>
      {items.map((item, index) => (
        <p 
          key={index}
          onClick={() => {
            if (item.type === 'local') {
              navigate(item.url);
            } else {
              window.open(item.url, '_blank');
            }
          }} 
          className="cursor-pointer text-[var(--color-text-secondary)] no-underline mb-0 text-[var(--font-size-sm)] transition-colors duration-200 hover:text-[var(--color-text-primary)]"
        >
          {item.label}
        </p>
      ))}
    </div>
  )
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={`w-full bg-[var(--color-background)] border-t border-[var(--color-border)] p-[var(--spacing-lg)_var(--spacing-md)] font-[var(--font-secondary)] mt-[var(--spacing-xl)] flex flex-col items-center ${className || ''}`}>
      <div className="max-w-[1200px] w-full mx-auto flex flex-wrap justify-center gap-8">
        <Section title="Our Team" items={[
          {
            label: 'Sales',
            url: 'mailto:founders@squeak.today',
            type: 'external'
          },
          {
            label: 'Discord',
            url: 'https://discord.gg/j8zFGqQEYk',
            type: 'external'
          },
          {
            label: 'Contact Us',
            url: '/contact-support.html',
            type: 'external'
          }
        ]} />

        <Section title="Socials" items={[
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
            label: 'TikTok',
            url: 'https://www.tiktok.com/@learnsqueak',
            type: 'external'
          }
        ]} />

        <Section title="Products" items={[
          {
            label: 'Squeak',
            url: '/',
            type: 'local'
          },
          {
            label: 'Squeak for Educators',
            url: '/educators',
            type: 'local'
          },
          {
            label: 'Squeak Premium',
            url: '/?section=pricing',
            type: 'local'
          }
        ]} />

        {/* <Section title="Privacy and Terms" items={[
          {
            label: 'Privacy Policy',
            url: '/privacy',
            type: 'local'
          },
          {
            label: 'Terms of Service',
            url: '/tos',
            type: 'local'
          }
        ]} /> */}

      
      
      </div>
      <div className="w-[90%] font-primary text-center pt-[var(--spacing-lg)] mt-[var(--spacing-lg)] border-t border-[var(--color-border)] text-[var(--color-text-secondary)] text-[var(--font-size-sm)]">
        © {new Date().getFullYear()} Squeak. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer; 