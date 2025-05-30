// Check if we're in development or production mode
const isDevelopment = import.meta.env.MODE === 'development';

export const API_CONFIG = {
  // Use localhost for development, AWS AppRunner URL for production
  BASE_URL: isDevelopment 
    ? 'http://localhost:5243' 
    : 'https://kxugm3udpe.eu-west-2.awsapprunner.com',
  ENDPOINTS: {
    AUTH_TOKEN: '/api/Auth/token',
    SEND_TO_TM: '/api/Events/send-to-tm',
    SEND_TO_REVIEWER: '/api/Events/send-to-reviewer',
    MARK_REVIEWER_FILLED: '/api/Events/send-to-reviewer'  // Same endpoint, but using DELETE method
  }
};
