import transporter from "../configs/nodemailer.js";
import Booking from "../models/booking.js"
import Hotel from "../models/Hotel.js";
import Room from "../models/room.js";


//funv=ction to check availiblity of room
const checkAvailablity = async ({checkInDate,checkOutDate,room})=>{
    try {
        const bookings = await Booking.find({
            room,
            checkInDate : {$lte: checkOutDate},
            checkOutDate: {$gte: checkInDate},
        });

        const isAvailable= bookings.length === 0;

        return isAvailable;

    } catch (error) {
        console.log(error.message);
    }
}

//api to check availablity of room
//post /api/bookings/check-availablity
export const checkAvailablityAPI = async (req , res) =>{
    try {
       const {room,checkInDate,checkOutDate} = req.body;
       const isAvailable = await checkAvailablity({checkInDate,checkOutDate,room});
       res.json({success: true,isAvailable})
    } catch (error) {
        res.json({success: false,message:error.message})
    }
}

//api to create a new booking 
//post /api/bookings/book
export const createBooking = async (req ,res)=>{
    try {
        const {room, checkInDate,checkOutDate,guests} = req.body;
        const user = req.user._id;

        //before booking check availablity
        const isAvailable = await checkAvailablity({
            checkInDate,
            checkOutDate,
            room
        })

        if(!isAvailable){
            res.json({success:false,message:"room us not available"})
        }

        //get totalprice from room
        const roomData = await Room.findById(room).populate("hotel");
        let totalPrice = roomData.pricePerNight;

        //calculate total price based on night
        const chceckIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)
        const timeDiff = checkOut.getTime()-chceckIn.getTime();
        const nights = Math.ceil(timeDiff)/(1000*3600*24);
        totalPrice *=nights;

        const booking = await Booking.create({
            user,
            room,
            hotel : roomData.hotel._id,
            guests: +guests,
            checkOutDate,
            checkInDate,
            totalPrice
        })
        const mailOptions={
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: 'Hotel Booking Details',
            html: `
                <h2>Your Booking Details</h2>
                <p>${req.user.username},</p>
                <p>Thank you for your booking! Here are your details: </p>
                <ul>
                    <li><strong>Booking ID :</strong> ${booking._id}</li>
                    <li><strong>Hotel Name :</strong> ${roomData.hotel.name}</li>
                    <li><strong>Location :</strong> ${roomData.hotel.address}</li>
                    <li><strong>Date :</strong> ${booking.checkInDate.toDateString()}</li>
                    <li><strong>Booking Amount:</strong>${process.env.CURRENCY || '$'} ${booking.totalPrice} /night</li>
                </ul>
                <p>We look forward to welcoming you!</p>
                <p>If you need to make any changes, feel free to contact us.</p>
            `
        }

        await transporter.sendMail(mailOptions)

        res.json({success:true,message:"booking created successfully"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

//api to get all bookings for a user
//get /api/bookings/user

export const getUSerBookings = async (req ,res)=>{
    try {
        const user = req.user._id;
        const bookings = await Booking.find({user}).populate("room hotel").sort({createdAt : -1})
        res.json({success:true,bookings})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"failed to fetch bookings"})
    }
}

 export const getHotelBookings = async (req, res)=>{
    try {
        const hotel = await Hotel.findOne({owner:req.auth().userId});
        if(!hotel){
            return res.json({success:false,message:"no hotel found"});
        }

        const bookings = await Booking.find({hotel: hotel._id}).populate("room hotel user").sort({createdAt : -1});

        const totalBookngs = bookings.length;
        

        const totalRevenue = bookings.reduce((acc,booking)=>acc +booking.totalPrice,0)

        res.json({success:true,dashboardData : {totalBookngs,totalRevenue,bookings}})

    } catch (error) {
         res.json({success:false,message:"failed to fetch bookings"})
    }
}