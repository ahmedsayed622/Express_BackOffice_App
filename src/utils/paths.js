// utils/paths.js - Portable path resolution for ESM
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Calculate project root from src/utils/paths.js
export const projectRoot = path.resolve(__dirname, "../../");

/**
 * Resolve path segments relative to project root
 * @param {...string} segments - Path segments to resolve
 * @returns {string} Absolute path from project root
 */
export const resolveFromRoot = (...segments) =>
  path.resolve(projectRoot, ...segments);

/**
 * Get directory name for current file (ESM compatible)
 * @param {string} metaUrl - import.meta.url from calling file
 * @returns {string} Directory name
 */
export const getDirname = (metaUrl) => path.dirname(fileURLToPath(metaUrl));

/**
 * Get filename for current file (ESM compatible)
 * @param {string} metaUrl - import.meta.url from calling file
 * @returns {string} File name
 */
export const getFilename = (metaUrl) => fileURLToPath(metaUrl);

export default {
  projectRoot,
  resolveFromRoot,
  getDirname,
  getFilename,
};
