import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Order from '@/models/Order';
import User from '@/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const body = await request.text();
        const sig = request.headers.get('stripe-signature');

        const event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        const handlePaymentIntent = async (paymentIntentId, isPaid) => {
            const sessions = await stripe.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId, userId } = sessions.data[0].metadata;

            await connectDB();

            if (isPaid) {
                await Order.findByIdAndUpdate(orderId, { isPaid: true });
                await User.findOneAndUpdate(
                    { userId },           // ← fixed: query by userId field
                    { cartItems: {} }     // ← fixed: cartItems not cartitems
                );
            } else {
                await Order.findByIdAndDelete(orderId);
            }
        };

        switch (event.type) {
            case 'payment_intent.succeeded': {
                await handlePaymentIntent(event.data.object.id, true);
                break;
            }
            case 'payment_intent.payment_failed': {  // ← fixed: correct event name
                await handlePaymentIntent(event.data.object.id, false);
                break;
            }
            default:
                console.log('Unhandled event type:', event.type);
                break;
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}