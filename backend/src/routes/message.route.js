import express from 'express';

const router=express.Router();
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, getBroadcastMessages, getNotifications, markNotificationsRead } from "../controllers/message.controller.js";


router.get("/users", protectRoute, getUsersForSidebar);
router.get("/broadcasts", protectRoute, getBroadcastMessages);
router.get("/notifications", protectRoute, getNotifications);
router.put("/notifications/read/:senderId", protectRoute, markNotificationsRead);
router.get("/:id", protectRoute, getMessages);


router.post("/send/:id", protectRoute, sendMessage);



export default router;