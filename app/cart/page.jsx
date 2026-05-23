'use client'
import React from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";

const Cart = () => {

const {
products,
router,
cartItems,
addToCart,
updateCartQuantity,
getCartCount
} = useAppContext();

return (
<> <Navbar />

  <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">

    {/* CART ITEMS */}
    <div className="flex-1">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
        <p className="text-2xl md:text-3xl text-gray-500">
          Your <span className="font-medium text-orange-600">Cart</span>
        </p>
        <p className="text-lg md:text-xl text-gray-500/80">
          {getCartCount()} Items
        </p>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="text-left">
            <tr>
              <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">Product Details</th>
              <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">Price</th>
              <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">Quantity</th>
              <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {Object.keys(cartItems).map((itemId) => {

              const product = products.find(
                p => String(p._id) === String(itemId)
              );

              if (!product || cartItems[itemId] <= 0) return null;

              const quantity = Number(cartItems[itemId]);

              const hasOffer =
                product.offeredPrice !== undefined &&
                product.offeredPrice !== null &&
                Number(product.offeredPrice) > 0;

              const finalPrice = hasOffer
                ? Number(product.offeredPrice)
                : Number(product.price);

              const subtotal = (finalPrice * quantity).toFixed(2);

              return (
                <tr key={itemId}>

                  {/* PRODUCT */}
                  <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                    <div>
                      <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">
                        <Image
                          src={product.image[0]}
                          alt={product.name}
                          className="w-16 h-auto object-cover mix-blend-multiply"
                          width={1280}
                          height={720}
                        />
                      </div>

                      <button
                        className="md:hidden text-xs text-orange-600 mt-1"
                        onClick={() => updateCartQuantity(product._id, 0)}
                        suppressHydrationWarning
                      >
                        Remove
                      </button>
                    </div>

                    <div className="text-sm hidden md:block">
                      <p className="text-gray-800">{product.name}</p>
                      <button
                        className="text-xs text-orange-600 mt-1"
                        onClick={() => updateCartQuantity(product._id, 0)}
                        suppressHydrationWarning
                      >
                        Remove
                      </button>
                    </div>
                  </td>

                  {/* PRICE */}
                  <td className="py-4 md:px-4 px-1 text-orange-600 font-semibold">
                    ${finalPrice.toFixed(2)}
                  </td>

                  {/* QUANTITY */}
                  <td className="py-4 md:px-4 px-1">
                    <div className="flex items-center md:gap-2 gap-1">
                      <button
                        onClick={() => updateCartQuantity(product._id, quantity - 1)}
                        suppressHydrationWarning
                      >
                        <Image src={assets.decrease_arrow} alt="decrease" className="w-4 h-4" />
                      </button>

                      <input
                        type="number"
                        value={quantity}
                        onChange={e =>
                          updateCartQuantity(product._id, Number(e.target.value))
                        }
                        className="w-8 border text-center appearance-none"
                        suppressHydrationWarning
                      />

                      <button
                        onClick={() => addToCart(product._id)}
                        suppressHydrationWarning
                      >
                        <Image src={assets.increase_arrow} alt="increase" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                  {/* SUBTOTAL */}
                  <td className="py-4 md:px-4 px-1 text-gray-600">
                    ${subtotal}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CONTINUE SHOPPING */}
      <button
        onClick={() => router.push('/all-products')}
        className="group flex items-center mt-6 gap-2 text-orange-600"
        suppressHydrationWarning
      >
        <Image
          className="group-hover:-translate-x-1 transition"
          src={assets.arrow_right_icon_colored}
          alt="arrow"
        />
        Continue Shopping
      </button>

    </div>

    {/* ORDER SUMMARY */}
    <OrderSummary />

  </div>
</>
);
};

export default Cart;