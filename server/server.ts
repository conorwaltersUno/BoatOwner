import { app } from "./app";
import http from "http";

const httpsServer = http.createServer(app);

const PORT = process.env.PORT || 3001;

httpsServer.listen(PORT, async () => {
  console.log(`🚀 BoatOwner API Server running on port ${PORT}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

