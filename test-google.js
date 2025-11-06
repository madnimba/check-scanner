const { GoogleAuth } = require("google-auth-library");

const keyJson = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 || "", "base64").toString("utf8");
const creds = JSON.parse(keyJson);

(async () => {
  try {
    const auth = new GoogleAuth({
      credentials: creds,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await auth.getClient();
    console.log("✅ Authentication client OK:", client.constructor.name);
  } catch (e) {
    console.error("🔴 ERROR:", e);
  }
})();
