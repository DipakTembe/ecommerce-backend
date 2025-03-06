const winston = require('winston');

// Define a custom log format for better readability and structure
const logFormat = winston.format.printf(({ timestamp, level, message, stack, name }) => {
  // If the message is an error, include the stack trace in the log
  if (stack) {
    return `${timestamp} ${level}: ${name ? name : 'Error'} - ${message} - ${stack}`;
  }
  return `${timestamp} ${level}: ${message}`;
});

// Create a logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.splat(), // Enables support for printf-style messages
    winston.format.json() // Logs in JSON format for structured logging
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Adds color to console output
        winston.format.simple() // Simple output format for the console
      ),
    }),
    new winston.transports.File({ 
      filename: 'logs/app.log', 
      format: winston.format.combine(winston.format.timestamp(), logFormat),
    }),
  ],
});

// Utility to log errors with stack trace for better debugging
const logError = (err) => {
  if (err instanceof Error) {
    logger.error(err.message, { stack: err.stack, name: err.name }); // Include stack trace and name
  } else {
    logger.error(err); // For non-Error Messages
  }
};

// Utility to log info or general messages
const logInfo = (message) => {
  logger.info(message);
};

// Utility to log warnings
const logWarning = (message) => {
  logger.warn(message);
};

module.exports = { logError, logInfo, logWarning };
