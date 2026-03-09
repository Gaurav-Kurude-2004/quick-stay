import User from "../models/user.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {

    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const payload = webhook.verify(req.body, headers);

    const { data, type } = payload;

    if (type === "user.created") {

      const userData = {
        _id: data.id,
        username: `${data.first_name || ""} ${data.last_name || ""}`,
        email: data.email_addresses[0].email_address,
        image: data.image_url,
      };

      await User.create(userData);
    }

    if (type === "user.deleted") {
      await User.findByIdAndDelete(data.id);
    }

    if (type === "user.updated") {
      await User.findByIdAndUpdate(data.id, {
        username: `${data.first_name || ""} ${data.last_name || ""}`,
        email: data.email_addresses[0].email_address,
        image: data.image_url,
      });
    }

    res.json({ success: true });

  } catch (error) {
    console.log("Webhook Error:", error.message);
    res.status(400).json({ success: false });
  }
};

export default clerkWebhooks;