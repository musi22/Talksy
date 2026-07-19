import express from "express";
import {
  getAllUsers,
  getAUser,
  loginUser,
  myProfile,
  updateName,
  verifyUser,
} from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";

import { redisClient } from "../index.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/verify", verifyUser);
router.get("/me", isAuth, myProfile);
router.get("/user/all", isAuth, getAllUsers);
router.get("/user/:id", getAUser);
router.post("/update/user", isAuth, updateName);

router.get("/debug/otp/:email", async (req, res) => {
  try {
    const otpKey = `otp:${req.params.email}`;
    const otp = await redisClient.get(otpKey);
    res.json({ otp });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
