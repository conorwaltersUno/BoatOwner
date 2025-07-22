import { Request, Response } from "express";

const okStatus = 200;
const internalServerError = 500;

export default async function health(req: Request, res: Response) {
  try {
    console.log(`🏥 Health check requested at ${new Date().toISOString()}`);
    
    // Basic health check response
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: process.env.DATABASE_URL ? 'configured' : 'not configured',
      port: process.env.PORT || 3001
    };
    
    console.log('✅ Health check successful:', healthData);
    return res.status(okStatus).json(healthData);
  } catch (error: any) {
    console.error('❌ Health check failed:', error);
    res.status(internalServerError).json({ 
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
