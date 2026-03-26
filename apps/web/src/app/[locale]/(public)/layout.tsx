import { SiteHeader, SiteFooter, WhatsAppFab } from '@/modules/core/components';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PublicLayout({ children, params }: Props) {
  const { locale } = await params;

  return (
    <>
      <SiteHeader locale={locale} />
      <main>{children}</main>
      <SiteFooter locale={locale} />
      <WhatsAppFab locale={locale} />
    </>
  );
}
