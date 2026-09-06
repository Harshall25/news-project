import cron from "node-cron";

console.log("Starting background cron scheduler...");
console.log("News fetch job scheduled to run every 4 hours.");

// Runs every 4 hours (e.g., 00:00, 04:00, 08:00, 12:00, 16:00, 20:00)
cron.schedule("0 */4 * * *", async () => {
  console.log(`[${new Date().toISOString()}] Running scheduled news fetch job...`);
  try {
    // Uses NEXTAUTH_URL as the base URL, defaults to localhost:3000
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      throw new Error("CRON_SECRET is not configured");
    }

    const res = await fetch(`${baseUrl}/api/jobs`, {
      headers: {
        Authorization: "Bearer " + cronSecret,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log(`[${new Date().toISOString()}] Job finished successfully:`, data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Job failed:`, error.message);
  }
});
