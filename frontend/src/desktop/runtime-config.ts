export interface DesktopRuntimeConfig {
    apiBaseUrl: string;
    healthUrl: string;
    port: number;
}

let desktopRuntimeConfig: DesktopRuntimeConfig | null = null;

export const setDesktopRuntimeConfig = (config: DesktopRuntimeConfig) => {
    desktopRuntimeConfig = config;
};

export const clearDesktopRuntimeConfig = () => {
    desktopRuntimeConfig = null;
};

export const getDesktopRuntimeConfig = () => desktopRuntimeConfig;

export const getRuntimeApiBaseUrl = () =>
    desktopRuntimeConfig?.apiBaseUrl || import.meta.env.VITE_API_URL || '/api';
