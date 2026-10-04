import "dotenv/config";

import { Worker } from "bullmq";
import { JinaEmbeddings } from "@langchain/community/embeddings/jina";
import { QdrantVectorStore}  from "@langchain/qdrant";
import {
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";

import redis from "../config/redis.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const jinaApiKey = process.env.JINA_API_KEY;
 const qdrantUrl = process.env.QDRANT_URL;
const qdrantApiKey = process.env.QDRANT_API_KEY;
const QDRANT_COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME;

 if (!jinaApiKey) {
    throw new Error("JINA_API_KEY is not defined in .env");
}

if (!qdrantUrl) {
    throw new Error("QDRANT_URL is missing");
}

if (!qdrantApiKey) {
    throw new Error("QDRANT_API_KEY is missing");
}

if (!QDRANT_COLLECTION_NAME) {
  throw new Error("QDRANT_COLLECTION_NAME is missing in .env");
}


const embeddings = new JinaEmbeddings({
     apiKey: jinaApiKey,
     model: "jina-embeddings-v3",
     dimensions: 1024,
 });


 const vectordb = await QdrantVectorStore.fromExistingCollection(
     embeddings,
     {
         url: qdrantUrl,
         apiKey: qdrantApiKey,
         collectionName: "nodejs_documents_jina_1024",
     }
 
 )

 if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing");
}
 const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey:GEMINI_API_KEY,
  temperature: 0.2,
});


async function processQuery(
  query: string
): Promise<string> {

      console.log("Query:", query);

        console.log("Searching vector database...");

        const searchResults = await vectordb.similaritySearch(
        query,
        5
        );

        console.log(
            "Relevant chunks found:",
            searchResults.length
            );    

          const context = searchResults
            .map((document) => document.pageContent)
            .join("\n\n");

        console.log("\nContext:");
        console.log(context.substring(0, 1000));


         const SYSTEM_PROMPT = `
        You are a helpful AI assistant.

        Answer the user's question using only the context provided below.

        If the answer cannot be found in the context, say:
        "I don't have enough information to answer that."

        Context:
        ${context}
        `;

        const response = await llm.invoke([
        
            {
                role: "system",
                content: SYSTEM_PROMPT,
            },

            {
                role:"user",
                content: query
            }
 
       ])

      const answer =
         typeof response.content === "string"
         ? response.content
         : JSON.stringify(response.content);
        console.log("\nAI Response:");
        console.log(answer);
     
     
        return answer;
    }


    const worker = new Worker(
        "query-processing",

     async (job) => {
          console.log("Query worker ");

          console.log("job Id", job.id);
          console.log("job name", job.name);

             const { query } = job.data as {
              query: string;
            };

              console.log("Query:", query);

           // Run processQuery inside the queue worker

           const result = await processQuery(query);
          
        // return result to bullmq    
           return result ;

        },

         {
            connection: redis,
        }

    )

//  Worker Events 

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed succcessfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed with error:`, err);

     console.log(
    "Error:",
     err.message
  );
  }
);
 



