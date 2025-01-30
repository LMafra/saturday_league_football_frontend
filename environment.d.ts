declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_AUTH_TOKEN: string;
      NODE_ENV: "development" | "production";
      BASE_URL: string;
      PORT?: string;
      PWD: string;
    }
  }
}
export {};
