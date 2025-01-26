function processEvent(event) {
    const email =
        event.properties?.$set?.email ||
        event.properties?.$set_once?.email;
  
    if (!email) {
        return event; // Return early if there's no email
    }

    const freeEmailProviders = [
        "gmail.com",
        "outlook.com",
        "hotmail.com",
        "yahoo.com",
        "aol.com",
        "icloud.com",
        "mail.com",
        "zoho.com",
        "protonmail.com",
        "gmx.com",
        "yandex.com",
        "mail.ru",
        "live.com",
        "msn.com",
        "inbox.com",
        "fastmail.com",
    ];

    const emailDomain = email.split('@')[1];
    const isFreeEmail = freeEmailProviders.includes(emailDomain);

    // Calculate fake email probability
    const localPart = email.split('@')[0];
    const lengthFactor = localPart.length >= 18 ? localPart.length / 50 : 0; // No length factor if length is below 18

    const digits = localPart.match(/\d/g) || [];
    const distinctDigits = new Set(digits).size;
    const excessDistinctDigits = Math.max(0, distinctDigits - 4);
    const digitFactor = excessDistinctDigits > 0 ? Math.pow(2, excessDistinctDigits) * 0.1 : 0; // Exponential growth with increase of distinct digits after 4

    const fakeProbability = Math.min(1, lengthFactor + digitFactor);

    return {
        ...event,
        properties: {
            ...event.properties,
            $set_once: {
                ...event.properties.$set_once,
                is_free_email: isFreeEmail,
                is_real_probability: parseFloat((1 - fakeProbability).toFixed(3)), 
            },
        },
    };
}
