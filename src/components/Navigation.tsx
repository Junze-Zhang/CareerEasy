import React from 'react';

interface NavItem {
  label: string;
  href?: string;
  dropdown?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Jobs', dropdown: [
      { label: 'Browse Jobs', href: '/jobs' },
      { label: 'Post a Job', href: '/jobs/post' },
    ] },
  { label: 'About Us', dropdown: [
      { label: 'Our Story', href: '/about' },
      { label: 'Careers', href: '/careers' },
    ] },
  { label: 'Contact', dropdown: [
      { label: 'Support', href: '/contact/support' },
      { label: 'Press', href: '/contact/press' },
    ] },
];

const Navigation: React.FC = () => {
  // UI logic for dropdowns can be added here (Headless UI or custom)
  return (
    <nav className="flex items-center justify-between py-6 px-8 bg-white border-b border-gray-100">
      <div className="font-bold text-xl text-[#2563EB]">CareerEasy</div>
      <ul className="flex gap-8">
        {navItems.map((item) => (
          <li key={item.label} className="relative group">
            {item.href ? (
              <a href={item.href} className="text-[#1E293B] hover:text-[#2563EB] transition-colors">{item.label}</a>
            ) : (
              <>
                <span className="cursor-pointer text-[#1E293B] hover:text-[#2563EB] transition-colors">{item.label}</span>
                {item.dropdown && (
                  <ul className="absolute left-0 mt-2 bg-white text-[#1E293B] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity min-w-[150px] z-10 border border-gray-100">
                    {item.dropdown.map((drop) => (
                      <li key={drop.href}>
                        <a href={drop.href} className="block px-4 py-2 hover:bg-gray-50">{drop.label}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold">J</div>
    </nav>
  );
};

export default Navigation; 