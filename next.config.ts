import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // uncode this for prod, then run in cmd: npm run build
  // после npm run build сформируется папка out, которую можно заливать на хост
  // output: 'export', // Генерирует статические файлы
  // eslint: {
  //   ignoreDuringBuilds: true, // Игнорировать ошибки ESLint при сборке (для прода лучше не включать)
  // },
  // // (Опционально) Если используете `next/image` с внешними картинками:
  // images: {
  //   unoptimized: true, // Отключает оптимизацию (иначе нужен Next.js сервер)
  // },
};

export default nextConfig;
