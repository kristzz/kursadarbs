import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import Navbar from "../../components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Paidn",
  description: "Where a perfect job finds you",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const { locale = 'en' } = await Promise.resolve(params); 

  let messages;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    notFound();
  }


  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Navbar locale={locale} />
          <div className="pt-24">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}