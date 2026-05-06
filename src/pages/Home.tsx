import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Hero } from '../components/home/Hero';
import { Categories } from '../components/home/Categories';
import { RoomSection } from '../components/home/RoomSection';
import { HotProducts } from '../components/home/HotProducts';
import { StoreMap } from '../components/layout/StoreMap';

export function Home() {
  return (
    <>
      <Helmet>
        <title>SWIPO — Illuminate Your Space</title>
        <meta name="description" content="Premium home decorations, furniture and building materials. Shop 200+ unique products." />
      </Helmet>
      <Hero />
      <Categories />
      <RoomSection />
      <HotProducts />
      <StoreMap />
    </>
  );
}
