import { BLACKLIST } from './blacklist'; // Ensure this file exists and is properly configured
import Mailcheck from 'mailcheck';

interface MailcheckSuggestion {
    address: string;
    domain: string;
    full: string;
}

export function processEvent(event: any) {
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

    // check blacklisted domains
    const isBlacklisted = BLACKLIST.includes(emailDomain);
    let fakeProbability = 0;
    let correctedEmail = email;

    if (isBlacklisted) {
        fakeProbability = 1; // If blacklisted, set fake probability to 1
    } else {
        // email corrections
        Mailcheck.run({
            email,
            suggested: (suggestion: MailcheckSuggestion) => {
                correctedEmail = suggestion.full;
            },
            empty: () => {
                correctedEmail = email;
            }
        });

        // Calculate fake email probability
        const localPart = email.split('@')[0];

        // Length factor
        const lengthFactor = localPart.length >= 18 ? localPart.length / 100 : 0;

        // Digit factor
        const digits = localPart.match(/\d/g) || [];
        const distinctDigits = new Set(digits).size;
        const excessDistinctDigits = Math.max(0, distinctDigits - 4);
        const digitFactor = excessDistinctDigits > 0 ? Math.pow(2, excessDistinctDigits) * 0.1 : 0;

        // Character variety factor
        const hasLowercase = /[a-z]/.test(localPart);
        const hasUppercase = /[A-Z]/.test(localPart);
        const hasDigits = /\d/.test(localPart);
        const hasSymbols = /[^a-zA-Z\d]/.test(localPart);

        const charTypes = [hasLowercase, hasUppercase, hasDigits, hasSymbols];
        const varietyFactor = charTypes.filter(Boolean).length / 4 * 0.5; // Increased impact, up to 0.5

        fakeProbability = Math.min(1, lengthFactor + digitFactor + varietyFactor);
    }

    const processedEvent = {
        ...event,
        properties: {
            ...event.properties,
            $set: {
                ...event.properties.$set,
                email: correctedEmail,
            },
            $set_once: {
                ...event.properties.$set_once,
                is_free_email: isFreeEmail,
                is_real_probability: parseFloat((1 - fakeProbability).toFixed(3)), 
            },
        },
    };

    console.log(processedEvent); // Log the processed event
    return processedEvent;
}

// Test the function with the given email
const testEvent = {
    properties: {
        $set: {
            email: 'sara.testjoan+2753@getjoan.com',
        },
    },
};

processEvent(testEvent);
