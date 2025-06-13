import devConfig, { DevConfig } from './dev';
import prodConfig, { ProdConfig } from './prod';

export type AppConfig = DevConfig | ProdConfig;

const env = process.env.REACT_APP_ENV || 'production';

const config: AppConfig = env === 'production' 
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