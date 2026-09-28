import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore}  from "@langchain/qdrant";
 import "dotenv/config";


 const apiKey = process.env.GEMINI_API_KEY;

 if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in .env");
}

 console.log(
  "Google API key loaded:",
  !!apiKey
);

const filePath = "./src/data/node_js_sample.pdf" ;

const loader = new PDFLoader(filePath);

const doc = await loader.load();

console.log("total pages:", doc.length);

console.log(doc[20]);


//  Split Documents

const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500 ,
    chunkOverlap: 50,
});

const chunks = await textSplitter.splitDocuments(doc);

console.log("Total chunks :", chunks.length);


//  vector embbediing 
const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
     apiKey: apiKey,
    outputDimensionality: 3072,
});


const testEmbedding = await embeddings.embedQuery("Hello world");

console.log("Embedding length:", testEmbedding.length);
console.log("First 5 values:", testEmbedding.slice(0, 5));

const vectors = await embeddings.embedDocuments(
    chunks.map((chunk) => chunk.pageContent)
);


console.log("Total chunks:", chunks.length);
console.log("total vectors:", vectors.length);
console.log("First vector length:", vectors[0]?.length);
console.log("first 10 values:", vectors[0]?.slice(0,10));


const qdrantUrl = process.env.QDRANT_URL;
const qdrantApiKey = process.env.QDRANT_API_KEY;

if (!qdrantUrl) {
    throw new Error("QDRANT_URL is missing in .env");
}

if (!qdrantApiKey) {
    throw new Error("QDRANT_API_KEY is missing in .env");
}

const vectorStore = await QdrantVectorStore.fromDocuments(
    chunks,
    embeddings,
    {
        url:qdrantUrl,
        apiKey:qdrantApiKey,
        collectionName: "nodejs_documents",
    }
);

console.log("Sucessfully stored documents in qdrant!")