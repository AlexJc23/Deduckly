export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}


