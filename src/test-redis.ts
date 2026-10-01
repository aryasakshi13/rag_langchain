import {Redis} from "ioredis";

const redis = new Redis({
  host: "localhost",
  port: 6379,
});

const response = await redis.ping();

console.log("Redis:", response);

await redis.quit();
