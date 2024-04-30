export const generateRandomPassword = () => {
    const length = 10;
    const charset = "abcdefgh!@#*ijklmnopqrs#@t@uv@*wxyzABCDEFGHIJKLM!@#*NOPQRSTUVW!@#*XYZ0123456789!@#*";

    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset.charAt(randomIndex);
    }

    return password;
};
