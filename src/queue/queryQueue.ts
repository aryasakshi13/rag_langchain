import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const queryQueue = new Queue("query-processing", {
  connection: redis,
});