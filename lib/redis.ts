import { createClient } from "redis";

declare global {
  // allow global var in dev
  var redis: ReturnType<typeof createClient> | undefined;
}

let client:any;

if (!global.redis) {
  global.redis = createClient({
    url: `redis://default:${process.env.REDIS_KEY}@spot-property-mirrored-54790.db.redis.io:13067`,
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