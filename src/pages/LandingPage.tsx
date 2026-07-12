import { useEffect } from 'react';
import { ContactSection, FAQSection, FeatureGrid, HeroSection, HowItWorks, LandingFooter, LandingHeader, LogoCloud, PricingSection, ProductShowcase, QRDemo, TestimonialsSection } from '../components/landing/LandingSections';

export const LandingPage = () => {
  useEffect(() => {
    document.title = 'Tapro | QR Ordering SaaS for Restaurants';
    const description = 'Tapro helps restaurants launch QR table ordering, manage digital menus, process orders, and run role-aware restaurant operations.';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <LandingHeader />
      <main>
        <HeroSection />
        <LogoCloud />
        <ProductShowcase />
        <QRDemo />
        <HowItWorks />
        <FeatureGrid />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
};
