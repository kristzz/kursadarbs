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
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-backgroundc opacity-50 z-10"
          onClick={closeMenu}
        ></div>
      )}

      <header className="fixed w-full p-4 items-center justify-between bg-transparent z-20 flex">
        <div className="w-20"></div>

        <nav className="flex justify-center gap-8 flex-grow hidden lg:flex">
          <Link href={`/${locale}/jobs`} className="duration-150">{t("jobs")}</Link>
          <Link href={`/${locale}/tasks`} className="duration-150">{t("tasks")}</Link>
          <Link href={`/${locale}/messages`} className="duration-150">{t("messages")}</Link>
          <Link href={`/${locale}/profile`} className="duration-150">{t("profile")}</Link>
        </nav>

        <div className="w-20 flex justify-end items-center gap-4">
          {!isAuthenticated && (
            <>
              <Link href={`/${locale}/auth/login`} className="text-sm duration-150">{t("login")}</Link>
              <Link href={`/${locale}/auth/register`} className="text-sm duration-150 hidden sm:inline-block">{t("register")}</Link>
            </>
          )}

          <select
            value={locale}
            onChange={handleLanguageChange}
            aria-label={t("selectLanguage")}
            className="text-textc bg-backgroundc rounded-md px-2 py-1 focus:ring-2 focus:ring-primaryc duration-150 font-sans"
            style={{ border: "1px solid rgba(237, 237, 237, 0.5)" }}
          >
            <option value="en">EN</option>
            <option value="lv">LV</option>
          </select>

          <button
            className="lg:hidden text-cgray"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="lg:hidden fixed top-16 left-0 w-full bg-cblack bg-opacity-80 p-4 pb-16 z-20">
          <nav className="flex flex-col items-center gap-4">
            <Link href={`/${locale}/jobs`} className="duration-150" onClick={closeMenu}>{t("jobs")}</Link>
            <Link href={`/${locale}/tasks`} className="duration-150" onClick={closeMenu}>{t("tasks")}</Link>
            <Link href={`/${locale}/messages`} className="duration-150" onClick={closeMenu}>{t("messages")}</Link>
            <Link href={`/${locale}/profile`} className="duration-150" onClick={closeMenu}>{t("profile")}</Link>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Navbar;

