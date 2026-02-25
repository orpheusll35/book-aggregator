
/**
 * Normalizes text for search by:
 * 1. Lowercasing with Turkish locale
 * 2. Replacing Turkish specific chars with ASCII equivalents
 * 3. Removing extra spaces
 */
function normalizeForSearch(str: string): string {
    if (!str) return "";
    return str
        .toLocaleLowerCase('tr-TR')
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Decodes Unicode escape sequences (\uXXXX) and HTML entities (&entity; or &#123;).
 */
function decodeText(str: string): string {
    if (!str) return str;

    let decoded = str;

    // 1. Handle Unicode Escapes (\uXXXX)
    decoded = decoded.replace(/\\u([\da-f]{4})/gi, (match, grp) => {
        return String.fromCharCode(parseInt(grp, 16));
    });

    // 2. Handle Numeric HTML Entities (&#1234;)
    decoded = decoded.replace(/&#(\d+);/g, (match, grp) => {
        return String.fromCharCode(parseInt(grp, 10));
    });

    // 3. Handle Hex HTML Entities (&#xABCD;)
    decoded = decoded.replace(/&#x([\da-f]+);/gi, (match, grp) => {
        return String.fromCharCode(parseInt(grp, 16));
    });

    // 4. Handle Named HTML Entities (Comprehensive Turkish & common ones)
    const entities: Record<string, string> = {
        '&nbsp;': ' ',
        '&amp;': '&',
        '&quot;': '"',
        '&lt;': '<',
        '&gt;': '>',
        '&apos;': "'",
        '&rsquo;': "'",
        '&lsquo;': "'",
        '&rdquo;': '"',
        '&ldquo;': '"',
        '&ouml;': 'ö', '&Ouml;': 'Ö',
        '&ccedil;': 'ç', '&Ccedil;': 'Ç',
        '&uuml;': 'ü', '&Uuml;': 'Ü',
        '&igrave;': 'ì', '&Igrave;': 'Ì',
        '&ograve;': 'ò', '&Ograve;': 'Ò',
        '&ugrave;': 'ù', '&Ugrave;': 'Ù',
        '&agrave;': 'à', '&Agrave;': 'À',
        '&egrave;': 'è', '&Egrave;': 'È',
        '&nbsp': ' ',
        '&rsquo': "'",
        // Handle common double-encoding artifacts or missing semicolons
        '&ouml': 'ö', '&Ouml': 'Ö',
        '&ccedil': 'ç', '&Ccedil': 'Ç',
        '&uuml': 'ü', '&Uuml': 'Ü',
        '&Icirc;': 'İ', '&icirc;': 'i',
        '&THORN;': 'Ş', '&thorn;': 'ş',
        '&ETH;': 'Ğ', '&eth;': 'ğ',
        '&Yacute;': 'İ', '&yacute;': 'ı',
        '&scedil;': 'ş', '&Scedil;': 'Ş'
    };

    decoded = decoded.replace(/&[a-z0-9#]+;?/gi, (match) => {
        const lookup = match.endsWith(';') ? match : match;
        const result = entities[lookup] || entities[lookup + ';'] || match;
        return result;
    });

    decoded = decoded.replace(/&[oO]uml/g, (m) => m.toLowerCase().includes('o') ? (m[1] === 'O' ? 'Ö' : 'ö') : m)
        .replace(/&[cC]cedil/g, (m) => m[1] === 'C' ? 'Ç' : 'ç')
        .replace(/&[uU]uml/g, (m) => m[1] === 'U' ? 'Ü' : 'ü')
        .replace(/&[iI]circ/g, (m) => m[1] === 'I' ? 'İ' : 'i')
        .replace(/&[sS]cedil/g, (m) => m[1] === 'S' ? 'Ş' : 'ş')
        .replace(/&[gG]breve/g, (m) => m[1] === 'G' ? 'Ğ' : 'ğ');

    return decoded.trim();
}

function test() {
    console.log("--- Testing normalizeForSearch ---");
    const testCases = [
        ["içimizdeki", "icimizdeki"],
        ["İÇİMİZDEKİ", "icimizdeki"],
        ["İçimizdeki", "icimizdeki"],
        ["icimizdeki", "icimizdeki"],
        ["IÇIMIZDEKI", "icimizdeki"],
        ["ışık", "isik"],
        ["İŞIK", "isik"],
        ["Şeytan", "seytan"],
        ["ÖMÜR", "omur"]
    ];

    testCases.forEach(([input, expected]) => {
        const result = normalizeForSearch(input);
        console.log(`Input: ${input} -> Result: ${result} [${result === expected ? 'PASS' : 'FAIL'}]`);
    });

    console.log("\n--- Testing decodeText ---");
    const entityCases = [
        ["&ouml;mür", "ömür"],
        ["&Ouml;mür", "Ömür"],
        ["&oumlmür", "ömür"],
        ["İ&icirc;mizdeki", "İimizdeki"],
        ["&scedil;eytan", "şeytan"],
        ["&ccedil;ocuk", "çocuk"],
        ["&Icirc;lim", "İlim"]
    ];

    entityCases.forEach(([input, expected]) => {
        const result = decodeText(input);
        console.log(`Input: ${input} -> Result: ${result} [${result === expected ? 'PASS' : 'FAIL'}]`);
    });
}

test();
