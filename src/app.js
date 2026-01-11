import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "express-async-errors";
import routes from "./routes/index.js";
import { logger } from "./utils/index.js";
import { ENV, getCorsOptions } from "./config/index.js";
import { errorMiddleware, generalLimiter } from "./middlewares/index.js";

const app = express();

app.set("trust proxy", 1);

const corsOptions = getCorsOptions();

const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
};

app.use(helmet(helmetOptions));
app.use(cors(corsOptions));

const shouldUseRateLimit =
  ENV.ENABLE_RATE_LIMITING === "true" || ENV.NODE_ENV === "production";

if (shouldUseRateLimit) {
  app.use(generalLimiter);
  logger.info("ƒ?? Rate limiting enabled");
} else {
  logger.info("ƒ?ÿ‹??  Rate limiting disabled - Internal environment detected");
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const morganFormat = ENV.NODE_ENV === "production" ? "combined" : "dev";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
    skip: () => ENV.NODE_ENV === "test",
  })
);

app.use("/api", routes);

app.get("/health", (req, res) => {
  const healthInfo = {
    status: "UP",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: ENV.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
    },
  };

  res.status(200).json(healthInfo);
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Express BackOffice API is running",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

app.use(errorMiddleware);

export default app;
