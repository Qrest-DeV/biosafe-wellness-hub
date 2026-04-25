import { Layout } from "@/components/Layout";
import { HeroCarousel } from "@/components/HeroCarousel";
import { SearchBar } from "@/components/SearchBar";
import { Categories } from "@/components/Categories";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { SubscriptionHighlight } from "@/components/SubscriptionHighlight";
import { TalkToPro } from "@/components/TalkToPro";
import { AestheticsPreview } from "@/components/AestheticsPreview";

const Index = () => {
  return (
    <Layout>
      <HeroCarousel />
      <SearchBar />
      <Categories />
      <FeaturedProducts />
      <SubscriptionHighlight />
      <TalkToPro />
      <AestheticsPreview />
    </Layout>
  );
};

export default Index;
