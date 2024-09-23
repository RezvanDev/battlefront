declare module '*.png' {
    const value: string;
    export default value;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

  interface ImportMetaEnv {
    readonly VITE_API_URL: string
    // здесь можно добавить другие переменные окружения
  }