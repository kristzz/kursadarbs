"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {useState, useEffect} from "react";
import { usePathname, useRouter } from "next/navigation";
import React, { ChangeEvent } from "react";

const Navbar = ({ locale }: { locale: string }) => {
  const t = useTranslations("NavbarLinks");
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as string;
    const path = pathname.split("/").slice(2).join("/");
    router.push(`/${newLocale}/${path}`);
  };

  useEffect(() => {
    const cookies = document.cookie;
    setIsAuthenticated(cookies.includes("authToken"));
  }, []);


  return (
    <header className="flex w-full p-4 items-center justify-between dark:bg-darkBrown opacity-60 hover:opacity-90 duration-300">
      <div className="w-20"></div>
      <nav className="flex justify-center gap-8 flex-grow">
        <Link href={`/${locale}/jobs`} className="hover:text-lightbrown dark:hover:text-darkGreen duration-150">{t("jobs")}</Link>
        <Link href={`/${locale}/tasks`} className="hover:text-lightbrown dark:hover:text-darkGreen duration-150">{t("tasks")}</Link>
        <Link href={`/${locale}/messages`} className="hover:text-lightbrown dark:hover:text-darkGreen duration-150">{t("messages")}</Link>
        <Link href={`/${locale}/profile`} className="hover:text-lightbrown dark:hover:text-darkGreen duration-150">{t("profile")}</Link>
      </nav>
      <div className="w-20 flex justify-end items-center gap-4">
        {!isAuthenticated ? (
          <>
            <Link href={`/${locale}/auth/login`} className="text-sm hover:text-lightbrown dark:hover:text-darkGreen duration-150">{t("login")}</Link>
            <Link href={`/${locale}/auth/register`} className="text-sm hover:text-lightbrown dark:hover:text-darkGreen duration-150">{t("register")}</Link>
          </>
        ) : (
          <></>
        )}

        <select
          value={locale}
          onChange={handleLanguageChange}
          aria-label={t("selectLanguage")}
          className="border text-lightGray rounded-md px-2 py-1 focus:ring-2 focus:ring-lightbrown dark:border-darkGreen dark:text-darkWhite dark:bg-darkBrown dark:focus:ring-darkGreen duration-150"
        >
          <option value="en">EN</option>
          <option value="lv">LV</option>
        </select>
      </div>
    </header>
  );
};

export default Navbar;