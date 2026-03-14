import { isDesktopMode } from './runtime';

const AUTH_TOKEN_KEY = 'geoeducation.desktop.auth-token';

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

export const getStoredAuthToken = () => {
    if (!isDesktopMode || !canUseStorage()) {
        return null;
    }

    return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setStoredAuthToken = (token: string | null) => {
    if (!isDesktopMode || !canUseStorage()) {
        return;
    }

    if (token) {
        window.localStorage.setItem(AUTH_TOKEN_KEY, token);
        return;
    }

    window.localStorage.removeItem(AUTH_TOKEN_KEY);
};
