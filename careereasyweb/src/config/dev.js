import baseConfig from './base';

const config = {
    ...baseConfig,
    API_BASE_URL: 'http://localhost:8000',
    ENV: 'development',
    DEBUG: true,
};

export default config; 