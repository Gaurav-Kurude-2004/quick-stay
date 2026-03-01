import Hotel from "../models/Hotel.js"
import Room from "../models/room.js"
import { v2 as cloudinary } from "cloudinary"


//api to create a new room for a hotel
export const createRoom = async (req , res) =>{
    try {
        const {roomType,pricePerNight,amenties} =req.body;
        const hotel = await Hotel.findOne({owner:req.auth.userId})

        if(!hotel) return res.json({success: false,message:"no hotel found"})

        //upload images to cloudinary
        const uploadImages = req.files.map(async (file)=>{
            const response = await cloudinary.uploader.upload(file.path);
            return response.secure_url;
        })

        const images = await Promise.all(uploadImages)

        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenties: JSON.parse(amenties),
            images
        })
        res.json({success:true, message:"room create successfully"})
    } catch (error) {
        res.status(500).json({success:false, message:error.message});
    }

}

//api to get all rooms
export const getRoom = async (req , res) =>{
    try {
       const rooms= await Room.find({isAvailable:true}).populate({
            path: 'hotel',
            populate:{
                path: 'owner',
                select:'image'
            }
       }).sort({createdAt:-1})
       res.json({success:true,rooms});

    } catch (error) {
        res.json({success:false,message:error.message});
        console.log(error);
        
    }
}

//api to create a new room for a hotel
export const getOwnerRooms = async (req, res) => {
  try {
    const { userId } = req.auth;


    const hotelData = await Hotel.findOne({ owner: req.user._id });

    if (!hotelData) {
      return res.json({ success: false, message: "No hotel found" });
    }

    const rooms = await Room.find({ hotel: hotelData._id }).populate("hotel");

    res.json({ success: true, rooms });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to create a new room for a hotel
export const toggleRoomAvailiblity = async (req , res) =>{
    try {
        const {roomId} = req.body;
        const roomData = await Room.findById(roomId);
        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();
        res.json({success:true,message : "room availiblity updated"})

    } catch (error) {
        res.json({success:false,message: error.message});
    }
}