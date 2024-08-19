import { app } from "./app";
import https from "https";
import fs from "fs";
import path from "path";

const key = fs.readFileSync(path.join(__dirname, "cert", "key.pem"));
const cert = fs.readFileSync(path.join(__dirname, "cert", "cert.pem"));

const httpsServer = https.createServer({ key, cert }, app);

const PORT = process.env.PORT || 3010;

httpsServer.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT} (HTTPS)`);
});
