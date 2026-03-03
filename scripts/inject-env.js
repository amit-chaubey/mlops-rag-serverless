const fs = require("fs");
const path = require("path");

const apiUrl = process.env.API_URL || "";
const outPath = path.join(__dirname, "..", "config.js");
const content = `// API URL - injected at build time (do not edit)\nwindow.API_URL = "${apiUrl.replace(/"/g, '\\"')}";\n`;

fs.writeFileSync(outPath, content, "utf8");
console.log("Injected API_URL into config.js");
