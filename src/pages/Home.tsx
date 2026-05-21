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
        <title>Maison Materiau</title>
        <meta name="description" content="Décorations, mobilier et matériaux de construction premium. Plus de 200 produits uniques." />
      </Helmet>
      <Hero />
      <Categories />
      <RoomSection />
      <HotProducts />
      <StoreMap />
    </>
  );
}
