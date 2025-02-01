import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

const locales = ['en', 'lv'] as const;
type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  try {
    const headersList = await headers();
    const locale = (headersList.get('X-NEXT-INTL-LOCALE') || 'en') as Locale;
    
    if (!locales.includes(locale)) {
      notFound();
    }

    return {
      messages: (await import(`../messages/${locale}.json`)).default,
      timeZone: 'UTC',
      now: new Date()
    };
  } catch (error) {
    return {
      messages: (await import(`../messages/en.json`)).default,
      timeZone: 'UTC',
      now: new Date()
    };
  }
});