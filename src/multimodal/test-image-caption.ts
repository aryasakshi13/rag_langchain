import "dotenv/config";
import {ChatGoogleGenerativeAI} from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";


const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

//  create gemini client 
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-3.8-flash",
  apiKey,
  temperature: 0.2,
});


async function main(){
    // const imageUrl = "https://www.pexels.com/photo/vibrant-statue-of-lord-krishna-with-floral-garlands-31708155/";
    const imageUrl = "https://images.pexels.com/photos/39356673/pexels-photo-39356673.jpeg?cs=srgb&dl=pexels-kim-magno-2163589000-39356673.jpg&fm=jpg&_gl=1*1rvfyft*_ga*MjIwMzY4MzgwLjE3OTE4MzEwOTE.*_ga_8JE65Q40S6*czE3OTE5MTM4NjYkbzMkZzEkdDE3OTE5MTM5MDMkajIzJGwwJGgw";

     const imageResponse = await fetch(imageUrl);

      if (!imageResponse.ok) {
        throw new Error(
        `Image download failed: ${imageResponse.status}`
        );
    }

    const mimeType =
    imageResponse.headers.get("content-type") || "image/jpeg";


    console.log("Content-Type:", mimeType);

    if (!mimeType.startsWith("image/")) {
    throw new Error(
        `Expected an image, but received: ${mimeType}. Use a direct image URL.`
    );
    }

    const imageBuffer = Buffer.from(
     await imageResponse.arrayBuffer()
   );
    

    // Convert to a Base64 data URL
    const base64Image =
       `data:${mimeType};base64,${imageBuffer.toString("base64")}`;

      console.log("Image downloaded and converted to Base64.");

    const response = await llm.invoke([
        new HumanMessage({
            content:[
                {
                    type: "text",
                   text: `Generate a caption at this image in about 50 words`
                },
                {
                    type: "image_url",
                    image_url: base64Image,

                }
                
            ]
        })
    ])

        // 4. Print the generated caption
         console.log("AI Response:", response.content);
}
main().catch(console.error);