import "dotenv/config";
import express from "express";

import { queryQueue } from "./queue/queryQueue.js";

const app = express();
const PORT = 5000;

app.use(express.json());

app.post("/chat", async (req, res) => {
    try{
        const {query} = req.body as {
            query?:string;

        }

        if(!query){
            return res.status(400).json({
            error: "Query is required",
            });
        }

         // Add query to BullMQ
            const job = await queryQueue.add(
            "process-query",
            {
                query,
            }
            );

             console.log("Query added to queue");
             console.log("Job ID:", job.id);
             console.log("Query:", query);

            // Return job ID immediately
            return res.status(202).json({
            status: "queued",
            jobId: job.id,
            });

    }catch(error){
        console.error("Error adding query:", error);

        return res.status(500).json({
            error: "Failed to queue query",
        });
    }
});

// start server 

app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
})