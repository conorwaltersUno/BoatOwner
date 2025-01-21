import { app } from "./app";
import http from "http";

const httpServer = http.createServer(app);

const PORT = process.env.PORT || 3010;

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} (HTTP)`);
});
