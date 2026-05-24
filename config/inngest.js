import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Order from "@/models/Order";
import Address from "@/models/Address"; // ✅ Add this
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const inngest = new Inngest({ id: "quickcart-next" });

// ... keep all existing functions unchanged ...

// ✅ New: Mark order as paid after Stripe checkout
export const handleStripePayment = inngest.createFunction(
    { id: 'handle-stripe-payment' },
    { event: 'stripe/checkout.session.completed' },
    async ({ event }) => {
        const { orderId } = event.data.metadata;

        await connectDB();
        await Order.findByIdAndUpdate(orderId, { isPaid: true });

        return { success: true, orderId };
    }
)