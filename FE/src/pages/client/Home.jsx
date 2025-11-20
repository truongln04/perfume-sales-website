import Banner from "../../components/Client/Banner";
import CategoryList from "../../components/Client/CategoryList";
import BrandList from "../../components/Client/BrandList";
import ProductGrid from "../../components/Client/ProductGrid";

export default function Home() {
  return (
    <>
      <Banner />
      {/* <CategoryList /> */}
      <BrandList /> 
      <ProductGrid />
    </>
  );
}
