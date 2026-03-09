import user from "../models/user.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {

    try {
        //create a svix instance with clerk webhook secret.
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        //Gwtting Headers
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        };

        // verifying Headers
       const payload = whook.verify(req.body, headers);
// const { data, type } = payload;
        //Getting Data from request body
        const { data, type } = payload


        //switch cases for different evevts
        switch (type) {
            
            case "user.created": {
                console.log(type);
                console.log(data);
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    username: data.first_name + " " + data.last_name,
                    image: data.image_url,
                }
                await user.create(userData);
                break;
            }
            case "user.updated": {
                console.log(type);
                console.log(data);
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    username: data.first_name + " " + data.last_name,
                    image: data.image_url,
                }
                await user.findByIdAndUpdate(data.id, userData);
                break;
            }
            case "user.deleted": {
                console.log(type);
                console.log(data);
                await user.findByIdAndDelete(data.id);
                break;
            }


            default:
                break;
        }

        res.json({ success: true, message: "webhook Received" })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

export default clerkWebhooks;