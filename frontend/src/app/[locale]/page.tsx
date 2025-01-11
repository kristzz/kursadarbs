import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Home');

  return (
    <main className="flex flex-col items-center justify-center gap-8 w-full max-w-[85%] sm:max-w-[70%] lg:max-w-[55%] mx-auto">
      <h1 className="text-4xl font-bold">{t('title')}</h1>
      <p className="text-xl">{t('description')}</p>
    </main>
  );
}
