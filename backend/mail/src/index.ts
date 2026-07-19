import express from "express";
import dotenv from "dotenv";
import { startSendOtpConsumer } from "./consumer.js";

dotenv.config();

startSendOtpConsumer();

const app = express();
app.use(express.json());

app.post("/send-otp", (req, res) => {
  const { to, subject, body } = req.body;
  console.log(`\n=================== [MOCK MAIL SERVICE] ===================`);
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:    ${body}`);
  console.log(`===========================================================\n`);
  res.status(200).json({ success: true, message: "Mock OTP logged to console" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
