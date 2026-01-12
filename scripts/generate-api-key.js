import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", ".env");

const key = crypto.randomBytes(32).toString("base64url");

let envContent = "";
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, "utf8");
}

const lineRegex = /^API_KEY=.*$/m;
if (lineRegex.test(envContent)) {
  envContent = envContent.replace(lineRegex, `API_KEY=${key}`);
} else {
  const needsNewline = envContent.length > 0 && !envContent.endsWith("\n");
  envContent = `${envContent}${needsNewline ? "\n" : ""}API_KEY=${key}\n`;
}

fs.writeFileSync(envPath, envContent, "utf8");

const masked = key.slice(-4);
console.log("API_KEY has been written to .env");
console.log(`API_KEY ends with: ${masked}`);
