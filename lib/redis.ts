import { createClient } from "redis";

declare global {
  // allow global var in dev
  var redis: ReturnType<typeof createClient> | undefined;
}

let client:any;

if (!global.redis) {
  global.redis = createClient({
    url: `redis://default:${process.env.REDIS_KEY}@redis-12635.crce283.ap-south-1-2.ec2.cloud.redislabs.com:12635`,
  });

  global.redis.on("error", (err) => {
    console.log("Redis Error", err);
  });
}

client = global.redis;

// connect only if not already connected
if (!client.isOpen) {
  await client.connect();
}

export default client;