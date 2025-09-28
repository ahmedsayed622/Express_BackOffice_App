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
      origin: [
        "http://10.1.118.200:3000",
        "http://10.1.118.200:8080",
        "http://localhost:3000", // Allow localhost for testing
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
            "http://10.1.118.69:3000",
            "http://10.1.118.69:8080",
            "https://10.1.118.69:3000",
            "https://10.1.118.69:8080",
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
