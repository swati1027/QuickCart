'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast/headless";

const ProductList = () => {
  const { router, getToken, user } = useAppContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch seller products
  const fetchSellerProduct = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/product/seller-list', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success && Array.isArray(data.products)) {
        // Ensure each product has an image array
        const cleanedProducts = data.products.map(p => ({
          ...p,
          image: Array.isArray(p.image) && p.image.length ? p.image : ['/placeholder.png'],
          offerPrice: p.offerPrice || p.offeredPrice || 0
        }));

        setProducts(cleanedProducts);
      } else {
        toast.error(data.message || "Failed to fetch products");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchSellerProduct();
  }, [user]);

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full md:p-10 p-4">
          <h2 className="pb-4 text-lg font-medium">All Products</h2>

          {products.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No products found.</p>
          ) : (
            <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
              <table className="table-fixed w-full overflow-hidden">
                <thead className="text-gray-900 text-sm text-left">
                  <tr>
                    <th className="w-2/3 md:w-2/5 px-4 py-3 font-medium truncate">Product</th>
                    <th className="px-4 py-3 font-medium truncate max-sm:hidden">Category</th>
                    <th className="px-4 py-3 font-medium truncate">Price</th>
                    <th className="px-4 py-3 font-medium truncate max-sm:hidden">Action</th>
                  </tr>
                </thead>

                <tbody className="text-sm text-gray-500">
                  {products.map((product, index) => (
                    <tr key={product._id || index} className="border-t border-gray-500/20">
                      <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                        <div className="bg-gray-500/10 rounded p-2">
                          <Image
                            src={product.image[0] || '/placeholder.png'}
                            alt={product.name || "product image"}
                            className="w-16"
                            width={1280}
                            height={720}
                          />
                        </div>
                        <span className="truncate w-full">{product.name || "Unnamed Product"}</span>
                      </td>

                      <td className="px-4 py-3 max-sm:hidden">{product.category || "N/A"}</td>
                      <td className="px-4 py-3">${product.offerPrice?.toFixed(2) || 0}</td>

                      <td className="px-4 py-3 max-sm:hidden">
                        <button
                          onClick={() => router.push(`/product/${product._id}`)}
                          className="flex items-center gap-1 px-1.5 md:px-3.5 py-2 bg-orange-600 text-white rounded-md"
                        >
                          <span className="hidden md:block">Visit</span>
                          <Image
                            className="h-3.5"
                            src={assets.redirect_icon}
                            alt="redirect icon"
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductList;
