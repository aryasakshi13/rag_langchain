import { queryQueue } from "./queryQueue.js";

const job = await queryQueue.add("process-query", {
  query: "What is Node.js?",
});

console.log("Query job added successfully!");
console.log("Job ID:", job.id);

await queryQueue.close();