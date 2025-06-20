import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-[#F8FAFC] text-[#1E293B] py-8 px-8 mt-16 border-t border-gray-100">
    <div className="flex flex-col md:flex-row md:justify-between gap-8">
      <div>
        <div className="font-bold text-xl text-[#2563EB] mb-2">CareerEasy</div>
        <div className="flex gap-4 text-[#64748B]">
          <a href="#" aria-label="Facebook" className="hover:text-[#2563EB]">FB</a>
          <a href="#" aria-label="Instagram" className="hover:text-[#2563EB]">IG</a>
          <a href="#" aria-label="X" className="hover:text-[#2563EB]">X</a>
        </div>
      </div>
      <div className="flex flex-wrap gap-8 text-sm">
        <div>
          <div className="font-semibold mb-2 text-[#1E293B]">Company</div>
          <ul className="space-y-1 text-[#64748B]">
            <li><a href="#" className="hover:text-[#2563EB]">About Us</a></li>
            <li><a href="#" className="hover:text-[#2563EB]">Careers</a></li>
            <li><a href="#" className="hover:text-[#2563EB]">Press</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2 text-[#1E293B]">Resources</div>
          <ul className="space-y-1 text-[#64748B]">
            <li><a href="#" className="hover:text-[#2563EB]">Blog</a></li>
            <li><a href="#" className="hover:text-[#2563EB]">Support</a></li>
            <li><a href="#" className="hover:text-[#2563EB]">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2 text-[#1E293B]">Connect</div>
          <ul className="space-y-1 text-[#64748B]">
            <li><a href="#" className="hover:text-[#2563EB]">Contact</a></li>
            <li><a href="#" className="hover:text-[#2563EB]">Twitter</a></li>
            <li><a href="#" className="hover:text-[#2563EB]">LinkedIn</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2 text-[#1E293B]">Legal</div>
          <ul className="space-y-1 text-[#64748B]">
            <li><a href="#" className="hover:text-[#2563EB]">Terms of Service</a></li>
            <li><a href="#" className="hover:text-[#2563EB]">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer; 