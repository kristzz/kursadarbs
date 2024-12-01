import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

const locales = ['en', 'lv'];

export default getRequestConfig(async () => {
  const headersList = await headers();
  const locale = headersList.get('X-NEXT-INTL-LOCALE') || 'en';

  if (!locales.includes(locale as any)) {
    notFound();
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});