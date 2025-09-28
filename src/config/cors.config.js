// config/cors.config.js
import { logger } from "../utils/index.js";

export function getCorsConfiguration() {
  const corsConfig = {
    development: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposedHeaders: ["X-Total-Count"],
      maxAge: 86400, // 24 hours
    },
    test: {
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : [
            "http://localhost:3000", // Default for testing
          ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposedHeaders: ["X-Total-Count"],
      maxAge: 3600, // 1 hour
    },
    production: {
      origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : [
            "https://your-production-domain.com",
            "http://your-production-server:3000",
          ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposedHeaders: ["X-Total-Count"],
      maxAge: 3600, // 1 hour
      optionsSuccessStatus: 200,
    },
  };

  const environment = process.env.NODE_ENV || "development";
  const config = corsConfig[environment];

  if (!config) {
    logger.warn(
      `CORS configuration not found for environment: ${environment}, using development defaults`,
      {
        service: "cors-config",
        environment,
        availableEnvironments: Object.keys(corsConfig),
      }
    );
    return corsConfig.development;
  }

  logger.info("CORS configuration loaded", {
    service: "cors-config",
    environment,
    allowedOrigins: config.origin,
    credentials: config.credentials,
  });

  return config;
}
