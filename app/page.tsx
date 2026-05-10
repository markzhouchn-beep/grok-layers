'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import CategoryPills from '@/components/home/CategoryPills';
import HowItWorks from '@/components/home/HowItWorks';
import ProductsShowcase from '@/components/home/ProductsShowcase';
import Testimonials from '@/components/home/Testimonials';
import CTABanner from '@/components/home/CTABanner';
import { useLang } from '@/lib/i18n';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CategoryPills />
        <HowItWorks />
        <ProductsShowcase />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}