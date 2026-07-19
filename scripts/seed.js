function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getOtp(email) {
  try {
    const res = await fetch(`http://localhost:4000/api/v1/debug/otp/${email}`);
    const data = await res.json();
    return data.otp;
  } catch (e) {
    console.error("Failed to fetch OTP for", email, e.message);
    return null;
  }
}

async function run() {
  console.log("🚀 Seeding local in-memory database...");

  // 1. Register Alex
  console.log("Requesting OTP for alex@example.com...");
  const loginAlexRes = await fetch("http://localhost:4000/api/v1/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "alex@example.com" }),
  });
  
  await sleep(1000);
  const alexOtp = await getOtp("alex@example.com");
  console.log("Fetched OTP for Alex:", alexOtp);
  if (!alexOtp) throw new Error("Could not retrieve OTP for Alex");

  const verifyAlexRes = await fetch("http://localhost:4000/api/v1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "alex@example.com", otp: alexOtp }),
  });
  const alexData = await verifyAlexRes.json();
  const alexToken = alexData.token;
  const alexId = alexData.user._id;
  console.log("✅ Alex registered successfully!");

  // 2. Register Bob
  console.log("Requesting OTP for bob@example.com...");
  await fetch("http://localhost:4000/api/v1/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "bob@example.com" }),
  });

  await sleep(1000);
  const bobOtp = await getOtp("bob@example.com");
  console.log("Fetched OTP for Bob:", bobOtp);
  if (!bobOtp) throw new Error("Could not retrieve OTP for Bob");

  const verifyBobRes = await fetch("http://localhost:4000/api/v1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "bob@example.com", otp: bobOtp }),
  });
  const bobData = await verifyBobRes.json();
  const bobToken = bobData.token;
  const bobId = bobData.user._id;
  console.log("✅ Bob registered successfully!");

  // 3. Create a chat room between Alex and Bob
  console.log("Creating chat room between Alex and Bob...");
  const newChatRes = await fetch("http://localhost:5000/api/v1/chat/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${alexToken}`
    },
    body: JSON.stringify({ otherUserId: bobId }),
  });
  const chatData = await newChatRes.json();
  const chatId = chatData.chatId;
  console.log("✅ Chat room established!");

  // 4. Send welcoming messages
  console.log("Sending initial messages...");
  await fetch("http://localhost:5000/api/v1/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${alexToken}`
    },
    body: JSON.stringify({ chatId: chatId, text: "Hello Bob! Welcome to Talksy!" }),
  });

  await fetch("http://localhost:5000/api/v1/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bobToken}`
    },
    body: JSON.stringify({ chatId: chatId, text: "Hey Alex! Thanks, it runs super fast in-memory!" }),
  });

  console.log("🎉 Seeding completed successfully!");
}

run().catch(console.error);
