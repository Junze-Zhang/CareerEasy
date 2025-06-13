import devConfig from './dev';
import prodConfig from './prod';

const env = process.env.REACT_APP_ENV || 'production';

// Only import the config we need
const config = env === 'production' 
  ? {
      ...prodConfig,
      API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "https://api.career-easy.com",
      ENV: "production",
      DEBUG: false
    }
  : {
      ...devConfig,
      API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000",
      ENV: "development",
      DEBUG: true
    };

export default config; 