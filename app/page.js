import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import CategorySection from "./components/CategorySection";
import ProductSection from "./components/ProductSection";
import FeaturesStrip from "./components/FeaturesStrip";
import TopSellingStrip from "./components/TopSellingStrip";
import PackagingGallery from "./components/PackagingGallery";

export default function Home() {
  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning>
      <main>
        <HeroBanner />
        <PackagingGallery />
        <TopSellingStrip />
        <CategorySection />
        <FeaturesStrip />
      </main>
    </div>
  );
}
