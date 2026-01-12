// utils/async/asyncWrapper.js
/**
 * Wraps an async Express route handler to automatically catch errors
 * and pass them to the Express error handling middleware
 * 
 * @param {Function} fn - The async route handler function
 * @returns {Function} - The wrapped route handler
 */
export const asyncWrapper = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Default export for backwards compatibility.
export default asyncWrapper;
