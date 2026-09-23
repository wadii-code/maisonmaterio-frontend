import { Seo } from '../components/seo/Seo';
import { organizationJsonLd, websiteJsonLd, localBusinessJsonLd } from '../lib/structuredData';
import { Hero } from '../components/home/Hero';
import { Categories } from '../components/home/Categories';
import { RoomSection } from '../components/home/RoomSection';
import { HotProducts } from '../components/home/HotProducts';
import { StoreMap } from '../components/layout/StoreMap';

export function Home() {
  return (
    <>
      <Seo
        title="Maison Materiau — Mobilier, décoration & matériaux de construction à Casablanca"
        description="Mobilier haut de gamme, décoration d’intérieur et matériaux de construction à Casablanca. Plus de 200 produits uniques, livraison partout au Maroc."
        canonicalPath="/"
        jsonLd={[organizationJsonLd(), websiteJsonLd(), localBusinessJsonLd()]}
      />
      <Hero />
      <Categories />
      <RoomSection />
      <HotProducts />
      <StoreMap />
    </>
  );
}
