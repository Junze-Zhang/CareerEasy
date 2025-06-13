import baseConfig, { BaseConfig } from './base';

export interface DevConfig extends BaseConfig {
  API_BASE_URL: string;
  ENV: 'development';
  DEBUG: boolean;
}

const config: DevConfig = {
  ...baseConfig,
  API_BASE_URL: 'https://api.career-easy.com',
  ENV: 'development',
  DEBUG: true,
};

export default config;