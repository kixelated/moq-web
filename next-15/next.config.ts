import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	webpack(config) {
		config.experiments = {
			asyncWebAssembly: true,
			layers: true,
		};

		return config;
	},
};

export default nextConfig;
