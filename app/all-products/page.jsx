'use client'
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading"; // ✅ optional

const AllProducts = () => {

  const { products = [] } = useAppContext(); // ✅ safe default

  return (
    <>
      <Navbar />

      <div className="flex flex-col px-6 md:px-16 lg:px-32">

        {/* ✅ HEADER */}
        <div className="pt-12 mb-6">
          <p className="text-2xl font-medium">All Products</p>
          <div className="w-16 h-0.5 bg-orange-600 rounded-full mt-1"></div>
        </div>

        {/* ✅ CONTENT */}
        {products.length === 0 ? (
          <div className="flex justify-center items-center py-20 w-full">
            {/* 👉 You can use Loading OR message */}
            {/* <Loading /> */}
            <p className="text-gray-500">No products available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-14 w-full">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

      </div>

      <Footer />
    </>
  );
};

export default AllProducts;
