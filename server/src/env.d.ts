declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REDIS_URL: string;
      DATABASE_URL: string;
      PORT: string;
      SESSION_SECRET: string;
      CORS_ORIGIN: string;
    }
  }
}

export {}
