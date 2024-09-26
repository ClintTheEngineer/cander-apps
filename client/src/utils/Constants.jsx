export const Constants = {
    SERVER_URL: (() => {
        const currentBaseUrl = window.location.hostname;
        if (currentBaseUrl === 'localhost:5173') {
            return new URL('http://localhost:8080');
        } else {
            return new URL('https://cander-apps-server.onrender.com');
        }
    })(),
    APP_NAME: 'Cander Apps',
    CURRENT_YEAR: new Date().getFullYear()
}
