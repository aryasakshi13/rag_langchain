//  import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JinaEmbeddings } from "@langchain/community/embeddings/jina";
import { QdrantVectorStore}  from "@langchain/qdrant";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
 import "dotenv/config";

 const jinaApiKey = process.env.JINA_API_KEY;
 const qdrantUrl = process.env.QDRANT_URL;
const qdrantApiKey = process.env.QDRANT_API_KEY;

 if (!jinaApiKey) {
    throw new Error("JINA_API_KEY is not defined in .env");
}

if (!qdrantUrl) {
    throw new Error("QDRANT_URL is missing");
}

if (!qdrantApiKey) {
    throw new Error("QDRANT_API_KEY is missing");
}
// const embeddings = new GoogleGenerativeAIEmbeddings({
//      model: "gemini-embedding-001",
//      apiKey: apiKey,
//      outputDimensionality: 3072,
// });

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


const retriever = vectordb.asRetriever({
    k: 5,
});

// const userQuery = "What is node js "

const rl = readline.createInterface({
    input,
    output,
});

const userQuery = await rl.question("Ask something: ");

rl.close();

const searchResult = await retriever.invoke(userQuery);

const context = searchResult
    .map((doc, index) => {
        return `
--- Context ${index + 1} ---
Page: ${doc.metadata.loc?.pageNumber ?? "Unknown"}

${doc.pageContent}
`;
    })
    .join("\n");

// console.log(context);

const SYSTEM_PROMPT = `You are a helpful AI assistant who answers the user's question
based only on the context retrieved from a PDF document.

Use the provided context to answer the question.

If the answer cannot be found in the provided context,
say that you could not find the answer in the document.

When possible, mention the relevant page number.

Context:
${context}


`;

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is missing in .env");
}

const model = new ChatGoogleGenerativeAI({
    model: "gemini-3.8-flash",
    apiKey: geminiApiKey,
  
});


const response = await model.invoke([
    {
        role: "system",
        content: SYSTEM_PROMPT,
    },

    {
        role: "user",
        content: userQuery,
    },
    

]);

console.log(response.content);






