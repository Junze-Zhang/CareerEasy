import baseConfig, { BaseConfig } from './base';

export interface DevConfig extends BaseConfig {
  API_BASE_URL: string;
  ENV: 'development';
  DEBUG: boolean;
}

const config: DevConfig = {
  ...baseConfig,
  API_BASE_URL: 'http://localhost:8000',
  ENV: 'development',
  DEBUG: true,
};

export default config;