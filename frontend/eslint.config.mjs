import nextConfigFromPkg from 'eslint-config-next';

const nextConfig = [
  ...nextConfigFromPkg,
  {
    rules: {
      // Add any custom rules here
    },
  },
];

export default nextConfig;
