import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, AlertTriangle } from 'lucide-react';
import { MAINTENANCE_CONFIG, getMaintenanceConfig } from '../data/webinarData';
import logoKemenkes from '../assets/images/logo kemenkes.png';
import logoKariadi from '../assets/images/Logo_RS_Kariadi_Resmi.png';
import logoPpni from '../assets/images/logo ppni.png';

interface NavbarProps {
  onOpenRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRegister }) => {
  const [activeSection, setActiveSection] = useState('beranda');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', href: '#beranda', id: 'beranda' },
    { label: 'Webinar', href: '#webinar', id: 'webinar' },
    { label: 'Pembayaran', href: '#pembayaran', id: 'pembayaran' },
    { label: 'Cara Daftar', href: '#cara-daftar', id: 'cara-daftar' },
    { label: 'FAQ', href: '#faq', id: 'faq' },
    { label: 'Narahubung', href: '#narahubung', id: 'narahubung' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = navLinks.map(link => link.id);
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-2.5 border-b border-slate-200'
          : 'bg-white py-4 border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Left Brand Logos */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <a href="#beranda" onClick={(e) => handleNavClick(e, '#beranda')} className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="flex items-center gap-2">
                <img
                  src={logoKariadi}
                  alt="Logo RS Kariadi"
                  className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
                />
                <img
                  src={logoPpni}
                  alt="Logo PPNI"
                  className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
                />
                <img
                  src={logoKemenkes}
                  alt="Logo Kemenkes RI"
                  className="h-7 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105 hidden xs:block"
                />
              </div>

              <div className="hidden lg:block border-l border-slate-300 pl-3">
                <span className="text-xs font-black text-slate-900 tracking-tight block leading-none">
                  RSUP DR. KARIADI
                </span>
                <span className="text-[10px] font-bold text-cyan-700 tracking-wider uppercase block mt-0.5">
                  DPK PPNI SEMARANG
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative px-3.5 py-2 text-sm font-medium transition-all duration-200 rounded-lg group ${
                    isActive
                      ? 'text-cyan-700 font-semibold'
                      : 'text-slate-600 hover:text-cyan-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-cyan-600 rounded-full transition-all duration-300 ${
                      isActive ? 'w-3/4' : 'w-0 group-hover:w-1/2 opacity-70'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Right CTA Button */}
          <div className="hidden sm:flex items-center">
            {getMaintenanceConfig().isClosed ? (
              <button
                onClick={onOpenRegister}
                className="relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-full shadow-md transition-all cursor-pointer animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
                <span>DITUTUP SEMENTARA</span>
              </button>
            ) : (
              <button
                onClick={onOpenRegister}
                className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-full shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer"
              >
                <span>DAFTAR SEKARANG</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            {getMaintenanceConfig().isClosed ? (
              <button
                onClick={onOpenRegister}
                className="px-3 py-1.5 text-[11px] font-black text-white bg-amber-600 rounded-full shadow-sm hover:bg-amber-700 transition-colors flex items-center gap-1"
              >
                <AlertTriangle className="w-3 h-3 text-amber-200" />
                <span>DITUTUP</span>
              </button>
            ) : (
              <button
                onClick={onOpenRegister}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 rounded-full shadow-sm hover:bg-red-700 transition-colors"
              >
                DAFTAR
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-cyan-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-cyan-600'
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegister();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-red-600 rounded-full shadow-md hover:bg-red-700"
            >
              <span>DAFTAR SEKARANG</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
