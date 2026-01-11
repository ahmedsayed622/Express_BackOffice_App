import { logger } from "../utils/index.js";
import { ENV } from "./bootstrap.js";

export function getCorsOptions() {
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
      maxAge: 86400,
    },
    test: {
      origin: ENV.ALLOWED_ORIGINS || ["http://localhost:3000"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposedHeaders: ["X-Total-Count"],
      maxAge: 3600,
    },
    production: {
      origin: ENV.ALLOWED_ORIGINS || [
        "https://your-production-domain.com",
        "http://your-production-server:3000",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposedHeaders: ["X-Total-Count"],
      maxAge: 3600,
      optionsSuccessStatus: 200,
    },
  };

  const environment = ENV.NODE_ENV || "development";
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
