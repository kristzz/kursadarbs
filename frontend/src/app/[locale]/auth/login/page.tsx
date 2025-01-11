import { useTranslations } from 'next-intl';

export default function Login() {
  const t = useTranslations('Login');

  return (
    <main className="flex flex-col items-center justify-between">
      <h1>{t('title')}</h1>
        <form>
            
        </form>
    </main>
  );
}