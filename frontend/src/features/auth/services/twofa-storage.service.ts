let temporaryToken: string | null = null;

export function setTemporaryToken(
    token: string
) {
    temporaryToken = token;
}

export function getTemporaryToken() {
    return temporaryToken;
}

export function clearTemporaryToken() {
    temporaryToken = null;
}
