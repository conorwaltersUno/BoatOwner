import { app } from "./app";
import http from "http";

const httpsServer = http.createServer(app);

const PORT = process.env.PORT || 3001;

httpsServer.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
});
