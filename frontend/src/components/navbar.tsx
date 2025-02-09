"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import React, { ChangeEvent } from "react";
import { Menu, X } from 'lucide-react';

const Navbar = ({ locale }: { locale: string }) => {
  const t = useTranslations("NavbarLinks");
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as string;
    const path = pathname.split("/").slice(2).join("/");
    router.push(`/${newLocale}/${path}`);
  };

  useEffect(() => {
    const cookies = document.cookie;
    setIsAuthenticated(cookies.includes("authToken"));
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="relative">
      <header className={`fixed w-full p-4 items-center justify-between z-20 flex max-w-full overflow-hidden
        ${isScrolled ? 'bg-backgroundc/70' : 'bg-backgroundc/50'} 
        backdrop-blur-md backdrop-saturate-150 border-b border-textc/10 transition-colors duration-200`}>
        <div className="w-20"></div>
        {/* Desktop Navigation */}
        <nav className="justify-center gap-8 flex-grow md:flex hidden">
          <Link href={`/${locale}/jobs`} className="text-textc hover:text-textc/80 duration-150">
            {t("jobs")}
          </Link>
          <Link href={`/${locale}/tasks`} className="text-textc hover:text-textc/80 duration-150">
            {t("tasks")}
          </Link>
          <Link href={`/${locale}/messages`} className="text-textc hover:text-textc/80 duration-150">
            {t("messages")}
          </Link>
          <Link href={`/${locale}/profile`} className="text-textc hover:text-textc/80 duration-150">
            {t("profile")}
          </Link>
        </nav>

        <div className="w-20 flex justify-end items-center gap-4">
          {!isAuthenticated && (
            <>
              <Link 
                href={`/${locale}/auth/login`} 
                className="text-sm text-textc hover:text-textc/80 duration-150"
              >
                {t("login")}
              </Link>
              <Link 
                href={`/${locale}/auth/register`} 
                className="text-sm text-textc hover:text-textc/80 duration-150"
              >
                {t("register")}
              </Link>
            </>
          )}
          <select
            value={locale}
            onChange={handleLanguageChange}
            aria-label={t("selectLanguage")}
            className="text-textc bg-backgroundc/80 rounded-md px-2 py-1 focus:ring-2 focus:ring-accentc duration-150 font-sans border border-textc/20"
          >
            <option value="en">EN</option>
            <option value="lv">LV</option>
          </select>
          <button
            className="md:hidden text-textc hover:text-textc/80"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-backgroundc/85 backdrop-blur-md backdrop-saturate-150 p-4 z-20 overflow-auto max-w-full border-b border-textc/10">
          <nav className="flex flex-col items-center gap-4 w-full">
            <Link 
              href={`/${locale}/jobs`} 
              className="text-textc hover:text-textc/80 duration-150 w-full text-center text-base" 
              onClick={closeMenu}
            >
              {t("jobs")}
            </Link>
            <Link 
              href={`/${locale}/tasks`} 
              className="text-textc hover:text-textc/80 duration-150 w-full text-center text-base" 
              onClick={closeMenu}
            >
              {t("tasks")}
            </Link>
            <Link 
              href={`/${locale}/messages`} 
              className="text-textc hover:text-textc/80 duration-150 w-full text-center text-base" 
              onClick={closeMenu}
            >
              {t("messages")}
            </Link>
            <Link 
              href={`/${locale}/profile`} 
              className="text-textc hover:text-textc/80 duration-150 w-full text-center text-base" 
              onClick={closeMenu}
            >
              {t("profile")}
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Navbar;
