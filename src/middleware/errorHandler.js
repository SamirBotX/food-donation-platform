// backend/src/middleware/errorHandler.js

// Centralized error handler middleware
export const errorHandler = (err, req, res, next) => {
    // Capture the correct status code
    const statusCode = err.statusCode || 500;
  
    // Always log full error in the terminal (for debugging & monitoring)
    console.error("❌ Server Error:", {
      message: err.message,
      stack: err.stack,
      route: req.originalUrl,
      method: req.method,
      body: req.body,
      params: req.params,
    });
  
    // Decide what message to show based on environment
    const response =
      process.env.NODE_ENV === "development"
        ? {
            success: false,
            message: err.message || "Internal Server Error",
            stack: err.stack, // include stack trace only in dev
            route: req.originalUrl,
            method: req.method,
          }
        : {
            success: false,
            message: err.message || "Something went wrong. Please try again later.",
          };
  
    // Send response
    res.status(statusCode).json(response);
  };
  
  // Helper function for throwing errors inside async functions
  export const asyncHandler =
    (fn) =>
    (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  