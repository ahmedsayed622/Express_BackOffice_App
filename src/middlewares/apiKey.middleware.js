import crypto from "crypto";
import { ENV } from "../config/index.js";
import { createError, ERROR_CODES } from "../utils/index.js";

export const requireApiKey = (req, res, next) => {
  const headerKey = req.header("x-api-key");
  const authHeader = req.header("authorization");
  let providedKey = headerKey;

  if (!providedKey && authHeader && authHeader.startsWith("Bearer ")) {
    providedKey = authHeader.slice(7).trim();
  }

  if (!providedKey) {
    return next(
      createError({
        code: ERROR_CODES.UNAUTHORIZED,
        status: 401,
        message: "API key is required",
      })
    );
  }

  if (!ENV.API_KEY) {
    return next(
      createError({
        code: ERROR_CODES.UNAUTHORIZED,
        status: 401,
        message: "API key is not configured",
      })
    );
  }

  const providedBuffer = Buffer.from(providedKey);
  const expectedBuffer = Buffer.from(ENV.API_KEY);

  if (providedBuffer.length !== expectedBuffer.length) {
    return next(
      createError({
        code: ERROR_CODES.FORBIDDEN,
        status: 403,
        message: "Invalid API key",
      })
    );
  }

  const isValid = crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  if (!isValid) {
    return next(
      createError({
        code: ERROR_CODES.FORBIDDEN,
        status: 403,
        message: "Invalid API key",
      })
    );
  }

  return next();
};

export default requireApiKey;
