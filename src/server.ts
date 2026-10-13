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

app.get("/job-status",async(req,res) =>{
   try{
    const{jobId } = req.query;

    if(!jobId || typeof jobId !== "string"){
        return res.status(400).json({
            error: "jobId query parameter is required",
        });
    }

    const job = await queryQueue.getJob(jobId);

    if(!job){
        return res.status(404).json({
            error: "job not found",
        });
    }

    const state = await job.getState();

    if(state === "completed"){
        return res.json({
            status: "completed",
            jobId: job.id,
            result:job.returnvalue,

        });

    }

    if(state == "failed"){
        return res.status(500).json({
            status: "failed",
            jobId: job.id,
            error: job.failedReason,
        });



    }
        
     return res.json({
      status: state,
      jobId: job.id,
    });
}catch (error) {
    console.error("Error getting job status:", error);

    return res.status(500).json({
      error: "Failed to get job status",
    });
  }

})

// start server 

app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
})