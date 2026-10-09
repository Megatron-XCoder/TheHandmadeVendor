/** @type {import('next').NextConfig} */
const nextConfig = {};

// Health check executed on server startup / restart
(async () => {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://gctojfyebvekqawzonjj.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_59teddVsFB55WTaTmI39DA_cdk5ENww";

  if (!supabaseUrl || !supabaseKey) {
    console.log("\n=======================================================");
    console.log("🔴 [The Handmade Vendor] Database Status: DISCONNECTED");
    console.log("   Reason: Supabase URL or key missing in environment.");
    console.log("=======================================================\n");
    return;
  }

  try {
    const https = require("https");
    const testUrl = new URL(
      "/rest/v1/profiles?select=id&limit=1",
      supabaseUrl
    );

    const req = https.request(
      testUrl,
      {
        method: "HEAD",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
      (res) => {
        if (res.statusCode >= 200 && res.statusCode < 500) {
          console.log("\n=======================================================");
          console.log("🟢 [The Handmade Vendor] Database Status: CONNECTED");
          console.log("   Supabase PostgreSQL is ONLINE & READY");
          console.log("   Endpoint: " + supabaseUrl);
          console.log("=======================================================\n");
        } else {
          console.log("\n=======================================================");
          console.log("🔴 [The Handmade Vendor] Database Status: DISCONNECTED");
          console.log("   HTTP Status: " + res.statusCode);
          console.log("=======================================================\n");
        }
      }
    );

    req.on("error", (err) => {
      console.log("\n=======================================================");
      console.log("🔴 [The Handmade Vendor] Database Status: DISCONNECTED");
      console.log("   Error: " + (err.message || String(err)));
      console.log("=======================================================\n");
    });

    req.end();
  } catch (err) {
    console.log("\n=======================================================");
    console.log("🔴 [The Handmade Vendor] Database Status: DISCONNECTED");
    console.log("   Exception: " + (err?.message || String(err)));
    console.log("=======================================================\n");
  }
})();

module.exports = nextConfig;
