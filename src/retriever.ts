import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore}  from "@langchain/qdrant";
 import "dotenv/config";

 const apiKey = process.env.GEMINI_API_KEY;
 const qdrantUrl = process.env.QDRANT_URL;
const qdrantApiKey = process.env.QDRANT_API_KEY;

 if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in .env");
}

if (!qdrantUrl) {
    throw new Error("QDRANT_URL is missing");
}

if (!qdrantApiKey) {
    throw new Error("QDRANT_API_KEY is missing");
}
const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
     apiKey: apiKey,
    outputDimensionality: 3072,
});

const vectordb = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
        url: qdrantUrl,
        apiKey: qdrantApiKey,
        collectionName: "nodejs_documents",
    }

)

