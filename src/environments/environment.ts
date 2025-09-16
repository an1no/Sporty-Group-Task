// Environment configuration
export interface Environment {
  production: boolean;
  apiUrl: string;
  enableConsoleLog: boolean;
}

export const environment: Environment = {
  production: true,
  apiUrl: 'https://www.thesportsdb.com/api/v1/json/3',
  enableConsoleLog: false
};