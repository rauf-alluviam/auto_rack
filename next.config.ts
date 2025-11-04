// import type { NextConfig } from 'next';

// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   experimental: {
//     allowedDevOrigins: ["https://autorack.alvision.in"],
//   },
// } as unknown as NextConfig;

// export default nextConfig;


import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Move allowedDevOrigins out of experimental
  allowedDevOrigins: ["https://autorack.alvision.in"],
};

export default nextConfig;



// import type { NextConfig } from 'next';

// const nextConfig: NextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },

//   async headers() {
//     return [
//       {
//         source: '/(.*)',
//         headers: [
//           { key: 'Access-Control-Allow-Origin', value: '*' },
//           { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
//           { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
//         ],
//       },
//     ];
//   },
// };

// export default nextConfig;



// import type { NextConfig } from 'next';

// const nextConfig: NextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
// };

// export default nextConfig;