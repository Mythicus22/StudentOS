export const generateRandomString = (n: number) => {
    let str = '';
    const bytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (let i = 0; i < n; i++) {
        const index = Math.floor(Math.random() * bytes.length);
        str = str + bytes[index];
    }
    return str;
}