import devConfig, { DevConfig } from './dev';
import prodConfig, { ProdConfig } from './prod';

export type AppConfig = DevConfig | ProdConfig;

const env = process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENV === 'development' ? 'development' : 'production';

const config: AppConfig = env === 'production' 
  ? {
      ...prodConfig,
      API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "https://api.career-easy.com",
      ENV: "production",
      DEBUG: false
    }
  : {
      ...devConfig,
      API_BASE_URL: process.env.REACT_APP_API_BASE_URL || devConfig.API_BASE_URL,
      ENV: "development",
      DEBUG: true
    };

export default config;