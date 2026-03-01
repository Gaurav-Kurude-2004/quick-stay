import express from "express"
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { createRoom, getOwnerRooms, getRoom, toggleRoomAvailiblity } from "../controllers/roomController.js";

const roomRouter = express.Router();

roomRouter.post('/',upload.array("images",4), createRoom)
roomRouter.get('/',getRoom)
roomRouter.get('/owner',protect,getOwnerRooms)
roomRouter.post('/toggle-availiblity',protect,toggleRoomAvailiblity)


export default roomRouter
