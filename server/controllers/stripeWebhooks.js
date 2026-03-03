import { response } from "express";
import Stripe from "stripe";
import Booking from "../models/booking.js";

//api to handel stripe webhooks

export const stripeWebhooks = async (request, response) => {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.log("❌ Webhook Signature Error:", error.message);
        return response.status(400).send(`Webhook error: ${error.message}`);
    }

    try {
        console.log("WEBHOOK HIT");
console.log("Event:", event.type);

        if (event.type === "payment_intent.succeeded") {

            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const sessions = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            if (!sessions.data.length) {
                console.log("❌ No session found");
                return response.json({ received: true });
            }

            const bookingId = sessions.data[0]?.metadata?.bookingId;
            console.log("Sessions:", sessions.data);
console.log("Metadata:", sessions.data[0]?.metadata);
console.log("Booking ID:", sessions.data[0]?.metadata?.bookingId);

            if (!bookingId) {
                console.log("❌ bookingId missing in metadata");
                return response.json({ received: true });
            }

            await Booking.findByIdAndUpdate(bookingId, {
                isPaid: true,
                paymentMethod: "Stripe"
            });

            console.log("✅ Booking updated:", bookingId);
        }

        response.json({ received: true });

    } catch (error) {
        console.log("🔥 WEBHOOK CRASH:", error);
        response.status(500).send("Server error");
    }
};