"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { ChangeEvent } from "react";

const Navbar = ({ locale }: { locale: string }) => {
  const t = useTranslations("NavbarLinks");
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as string;
    const path = pathname.split("/").slice(2).join("/");
    router.push(`/${newLocale}/${path}`);
  };

  return (
    <header className="flex w-full p-4 items-center justify-between dark:bg-darkBrown">
      <div className="w-20"></div> {/* Spacer to balance the layout */}
      <nav className="flex justify-center gap-8 flex-grow">
        <Link href={`/${locale}/jobs`} className="hover:text-lightbrown dark:hover:text-darkGreen">{t("jobs")}</Link>
        <Link href={`/${locale}/tasks`} className="hover:text-lightbrown dark:hover:text-darkGreen">{t("tasks")}</Link>
        <Link href={`/${locale}/messages`} className="hover:text-lightbrown dark:hover:text-darkGreen">{t("messages")}</Link>
        <Link href={`/${locale}/profile`} className="hover:text-lightbrown dark:hover:text-darkGreen">{t("profile")}</Link>
      </nav>
      <div className="w-20 flex justify-end">
        <select
          value={locale}
          onChange={handleLanguageChange}
          aria-label={t("selectLanguage")}
          className="border text-lightGray rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-lightbrown dark:border-darkGreen dark:text-darkWhite dark:bg-darkBrown dark:focus:ring-darkGreen"
        >
          <option value="en">EN</option>
          <option value="lv">LV</option>
        </select>
      </div>
    </header>
  );
};

export default Navbar;

