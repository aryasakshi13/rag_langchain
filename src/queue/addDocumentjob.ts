import {documentQueue} from "./documentQueue.js";

const job = await documentQueue.add("process-document", {
  filePath: "./src/data/node_js_sample.pdf",
});

console.log("job added successfully");

console.log("job Id:", job.id);

await documentQueue.close();