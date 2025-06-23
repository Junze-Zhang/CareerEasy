export interface BaseConfig {
  API_TIMEOUT: number;
  MAX_RETRIES: number;
  DEFAULT_PAGE_SIZE: number;
}

const config: BaseConfig = {
  API_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_RETRIES: 3,
  DEFAULT_PAGE_SIZE: 20,
};

export default config;