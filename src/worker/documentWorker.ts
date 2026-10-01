import {Worker} from "bullmq";
import redis from "../config/redis.js";

const worker = new Worker(
    "document-processing",
    async (job) => {
        console.log("Processing job...");
        console.log("Job ID:", job.id);
        console.log("job name:", job.name);
        console.log("File:", job.data.filePath);   
        
        return {
            success: true,

        };

    },
    {
        connection: redis,
    }
        // Add your document processing logic here
    
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed with error:`, err);
});