export const Constants = {
    SERVER_URL: (() => {
        const currentBaseUrl = window.location.hostname;
        if (currentBaseUrl === 'https://cander-apps.onrender.com') {
            return new URL('https://cander-apps-server.onrender.com');
        } else {
            return new URL('https://cander-apps-server.onrender.com');
        }
    })(),
    APP_NAME: 'Cander Apps',
    CURRENT_YEAR: new Date().getFullYear()
}
