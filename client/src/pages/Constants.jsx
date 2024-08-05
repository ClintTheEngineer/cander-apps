export const Constants = {
    SERVER_URL: (() => {
        const currentBaseUrl = window.location.hostname;
        if (currentBaseUrl === 'sample-url.com') {
            return new URL('https://sample-url.com');
        } else {
            return new URL('http://localhost:8080');
        }
    })(),
    APP_NAME: 'Cander Apps'
}