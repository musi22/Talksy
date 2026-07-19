import amql from "amqplib";

let channel: amql.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amql.connect({
      protocol: "amqp",
      hostname: process.env.Rabbitmq_Host,
      port: 5672,
      username: process.env.Rabbitmq_Username,
      password: process.env.Rabbitmq_Password,
    });

    channel = await connection.createChannel();

    console.log("✅ connected to rabbitmq");
  } catch (error) {
    console.log("Failed to connect to rabbitmq, using HTTP mock callback");
  }
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.log("⚠️ RabbitMQ channel is not initialized. Sending via local HTTP mock...");
    try {
      const response = await fetch("http://127.0.0.1:6001/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
      if (response.ok) {
        console.log("✅ Forwarded OTP message to mail service via HTTP");
      } else {
        console.log("Failed to send OTP via mail service HTTP:", response.statusText);
      }
    } catch (e: any) {
      console.log("Error forwarding message via HTTP:", e.message);
    }
    return;
  }

  await channel.assertQueue(queueName, { durable: true });

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};
