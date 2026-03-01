import User from "../models/user.js";

//middleware to check if user is authenticated

export const protect = async (req, res, next) => {
    try {
        const { userId } = req.auth();   // ✅ Clerk v5 correct usage

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;  // ✅ attach user to request
        next();

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};