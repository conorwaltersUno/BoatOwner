import { app } from "./app";
import http from "http";

const httpServer = http.createServer();

const PORT = process.env.PORT || 3010;

httpServer.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
});
