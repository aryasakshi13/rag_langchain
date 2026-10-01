import {documentQueue} from "./documentQueue.js";

const job = await documentQueue.add("process-document", {
  filePath: "path/to/document.pdf",
});

console.log("job added successfully");

console.log("job Id:", job.id);

await documentQueue.close();