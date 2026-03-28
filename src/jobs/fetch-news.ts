import cron from "node-cron";
import axios from "axios";

const url = process.env.NEXTAUTH_URL;

if (!url) {
  throw new Error("NEXTAUTH_URL not defined");
}

async function callEndpoint() {
  await axios.get(`${url}/api/jobs`, {
    timeout: 5000,
  });
}

// prevent duplicate cron registration
if (!(global as any)._cron_started) {
  (global as any)._cron_started = true;

  cron.schedule("0 0,2,5,7,10,12,15,17,20,22 * * *", async () => {
    try {
      await callEndpoint();
      console.log("cron executed");
    } catch (e: any) {
      console.error("cron failed:", e.message);
    }
  });
}