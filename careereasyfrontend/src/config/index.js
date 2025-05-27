import devConfig from './dev';
import prodConfig from './prod';

const env = process.env.REACT_APP_ENV || 'development';

// Only import the config we need
const config = env === 'production' 
  ? {
      ...prodConfig,
      API_BASE_URL: "https://career-easy.com/api",
      ENV: "production",
      DEBUG: false
    }
  : {
      ...devConfig,
      API_BASE_URL: "http://localhost:8000",
      ENV: "development",
      DEBUG: true
    };

export default config; 