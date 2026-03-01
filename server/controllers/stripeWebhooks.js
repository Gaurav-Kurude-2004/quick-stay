import { response } from "express";
import Stripe from "stripe";
import Booking from "../models/booking.js";

//api to handel stripe webhooks

export const stripeWebhooks = async (request , response) =>{
    //stripe gateway initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature']
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(request.body,sig,process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        response.status(400).send(`webhook error: ${error.message}`)
    }

    if(event.type === "payment_intent.succeeded"){
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        //getting session metadata 
        const session = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntentId,
        });

        const {bookingsId} = session.data[0].metadata;

        //mark payment as paid
        await Booking.findByIdAndUpdate(bookingsId, {isPaid:true,paymentMethod:"Stripe"})
    }else{
        console.log("unhandled event type: ", event.type)
    }
    response.json({received:true});
}