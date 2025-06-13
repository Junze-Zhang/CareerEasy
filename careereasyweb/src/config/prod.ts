import baseConfig, { BaseConfig } from './base';

export interface ProdConfig extends BaseConfig {
  API_BASE_URL: string;
  ENV: 'production';
  DEBUG: boolean;
}

const config: ProdConfig = {
  ...baseConfig,
  API_BASE_URL: 'https://api.career-easy.com',
  ENV: 'production',
  DEBUG: false,
};

export default config;