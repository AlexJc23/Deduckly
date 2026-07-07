let setupData: {
    secret: string;
    otpauth_url: string;
} | null = null;

export function setSetupData (data: {
    secret: string;
    otpauth_url: string;
}) {
    setupData = data;
}

export function getSetupData() {
    return setupData;
}

export function clearSetupData() {
    setupData = null;
}
