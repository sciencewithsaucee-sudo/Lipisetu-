/*
 * Lipisetu (लिपिसेतु) v1.5.1
 * The Smart Sanskrit Transliteration & Analysis Tool
 * * This file contains the complete, self-contained logic for the
 * Lipisetu application. It is designed to be loaded by an HTML
 * file and run entirely in the client.
 * * @author Sparsh Varshney, with contributions from Gemini
 * @version 1.5.1
 */

// --- ENCAPSULATION WRAPPER ---
// We wrap the entire script in a function to avoid polluting
// the global namespace, especially when embedded in other sites.
(function() {

    // --- CONSTANTS AND MAPPING DATA ---
        
    const DEV_VIRAMA = '\u094D';
    const TEL_VIRAMA = '\u0C4D';
    const DEV_NUKTA = '\u093C';
    const DEV_CHANDRABINDU = '\u0901'; // ँ

    // --- IAST -> SCRIPT MAPPINGS ---

    // IAST to Devanagari Mapping (Virama forms for consonants)
    const IAST_TO_DEV_MAP = new Map([
        // Vowels (Independent)
        ['a', 'अ'], ['ā', 'आ'], ['i', 'इ'], ['ī', 'ई'], ['u', 'उ'], ['ū', 'ऊ'], 
        ['ṛ', 'ऋ'], ['ṝ', 'ॠ'], ['ḷ', 'ऌ'], ['ḹ', 'ॡ'], 
        ['e', 'ए'], ['o', 'ओ'], ['ai', 'ऐ'], ['au', 'औ'],
        // Consonants (mapped to Virama form EXPLICITLY)
        ['k', 'क' + DEV_VIRAMA], ['kh', 'ख' + DEV_VIRAMA], ['g', 'ग' + DEV_VIRAMA], ['gh', 'घ' + DEV_VIRAMA], ['ṅ', 'ङ' + DEV_VIRAMA],
        ['c', 'च' + DEV_VIRAMA], ['ch', 'छ' + DEV_VIRAMA], ['j', 'ज' + DEV_VIRAMA], ['jh', 'झ' + DEV_VIRAMA], ['ñ', 'ञ' + DEV_VIRAMA],
        ['ṭ', 'ट' + DEV_VIRAMA], ['ṭh', 'ठ' + DEV_VIRAMA], ['ḍ', 'ड' + DEV_VIRAMA], ['ḍh', 'ढ' + DEV_VIRAMA], ['ṇ', 'ण' + DEV_VIRAMA],
        ['t', 'त' + DEV_VIRAMA], ['th', 'थ' + DEV_VIRAMA], ['d', 'द' + DEV_VIRAMA], ['dh', 'ध' + DEV_VIRAMA], ['n', 'न' + DEV_VIRAMA],
        ['p', 'प' + DEV_VIRAMA], ['ph', 'फ' + DEV_VIRAMA], ['b', 'ब' + DEV_VIRAMA], ['bh', 'भ' + DEV_VIRAMA], ['m', 'म' + DEV_VIRAMA],
        ['y', 'य' + DEV_VIRAMA], ['r', 'र' + DEV_VIRAMA], ['l', 'ल' + DEV_VIRAMA], ['v', 'व' + DEV_VIRAMA], 
        ['ś', 'श' + DEV_VIRAMA], ['ṣ', 'ष' + DEV_VIRAMA], ['s', 'स' + DEV_VIRAMA], ['h', 'ह' + DEV_VIRAMA],
        // Special Signs/Conjuncts
        ['ṃ', 'ं'], ['m̐', 'ँ'], ['ḥ', 'ः'], ["'", 'ऽ'], ['|', '।'], ['||', '॥'],
        ['kṣ', 'क्ष' + DEV_VIRAMA], ['jñ', 'ज्ञ' + DEV_VIRAMA], ['tr', 'त्र' + DEV_VIRAMA],
        // Nukta IAST mappings
        ['q', 'क़' + DEV_VIRAMA], ['x', 'ख़' + DEV_VIRAMA], ['ġ', 'ग़' + DEV_VIRAMA], ['z', 'ज़' + DEV_VIRAMA], ['f', 'फ़' + DEV_VIRAMA],
        // Note: IAST 'ṛ' is ambiguous (ऋ vs ड़). This map prioritizes ड़ for reverse mapping.
        // This is a known ambiguity in IAST. We will handle the ऋ vs ḍ in the Script->IAST logic.
        ['ṛ', 'ड़' + DEV_VIRAMA], // This is actually 'ḍ' with nukta, let's map it from 'ḍ' later
        ['ṛh', 'ढ़' + DEV_VIRAMA] // This is 'ḍh' with nukta
    ]);
    
    // IAST to Telugu Mapping (Virama forms for consonants)
    const IAST_TO_TELUGU_MAP = new Map([
        // Vowels (Independent)
        ['a', 'అ'], ['ā', 'ఆ'], ['i', 'ఇ'], ['ī', 'ఈ'], ['u', 'ఉ'], ['ū', 'ఊ'], 
        ['ṛ', 'ఋ'], ['ṝ', 'ౠ'], ['ḷ', 'ఌ'], ['ḹ', 'ౡ'], 
        ['e', 'ఎ'], ['o', 'ఒ'], ['ai', 'ఐ'], ['au', 'ఔ'],
        // Consonants (mapped to Virama form EXPLICITLY)
        ['k', 'క' + TEL_VIRAMA], ['kh', 'ఖ' + TEL_VIRAMA], ['g', 'గ' + TEL_VIRAMA], ['gh', 'ఘ' + TEL_VIRAMA], ['ṅ', 'ఙ' + TEL_VIRAMA],
        ['c', 'చ' + TEL_VIRAMA], ['ch', 'ఛ' + TEL_VIRAMA], ['j', 'జ' + TEL_VIRAMA], ['jh', 'ఝ' + TEL_VIRAMA], ['ñ', 'ఞ' + TEL_VIRAMA],
        ['ṭ', 'ట' + TEL_VIRAMA], ['ṭh', 'ఠ' + TEL_VIRAMA], ['ḍ', 'డ' + TEL_VIRAMA], ['ḍh', 'ఢ' + TEL_VIRAMA], ['ṇ', 'ణ' + TEL_VIRAMA],
        ['t', 'త' + TEL_VIRAMA], ['th', 'థ' + TEL_VIRAMA], ['d', 'ద' + TEL_VIRAMA], ['dh', 'ధ' + TEL_VIRAMA], ['n', 'న' + TEL_VIRAMA],
        ['p', 'ప' + TEL_VIRAMA], ['ph', 'ఫ' + TEL_VIRAMA], ['b', 'బ' + TEL_VIRAMA], ['bh', 'భ' + TEL_VIRAMA], ['m', 'మ' + TEL_VIRAMA],
        ['y', 'య' + TEL_VIRAMA], ['r', 'ర' + TEL_VIRAMA], ['l', 'ల' + TEL_VIRAMA], ['v', 'వ' + TEL_VIRAMA], 
        ['ś', 'శ' + TEL_VIRAMA], ['ṣ', 'ష' + TEL_VIRAMA], ['s', 'స' + TEL_VIRAMA], ['h', 'హ' + TEL_VIRAMA],
        // Special Signs/Conjuncts
        ['ṃ', 'ం'], ['m̐', 'ఁ'], ['ḥ', 'ః'], ["'", 'ఽ'], ['|', '।'], ['||', '॥'],
        ['kṣ', 'క్ష' + TEL_VIRAMA], ['jñ', 'జ్ఞ' + TEL_VIRAMA], ['tr', 'త్ర' + TEL_VIRAMA] // Telugu 'tr' is often special
    ]);
    
    // Matra Mapping (Devanagari/Telugu Vowel Signs)
    const MATRA_MAPS = {
        devanagari: {
            'आ': 'ा', 'इ': 'ि', 'ई': 'ी', 'उ': 'ु', 'ऊ': 'ू', 'ऋ': 'ृ', 
            'ॠ': 'ॄ', 'ऌ': 'ॢ', 'ॡ': 'ॣ', 'ए': 'े', 'ऐ': 'ै', 'ओ': 'ो', 'औ': 'ौ',
        },
        telugu: {
            'ఆ': 'ా', 'ఇ': 'ి', 'ఈ': 'ీ', 'ఉ': 'ు', 'ఊ': 'ూ', 'ఋ': 'ృ', 
            'ౠ': 'ౄ', 'ఌ': 'ౢ', 'ౡ': 'ౣ', 'ఎ': 'ె', 'ఐ': 'ై', 'ఒ': 'ొ', 'ఔ': 'ౌ',
        }
    };

    // --- SCRIPT -> IAST MAPPINGS ---

    // Devanagari to IAST
    const DEV_MATRA_TO_IAST = {
        'ा': 'ā', 'ि': 'i', 'ी': 'ī', 'ु': 'u', 'ू': 'ū', 'ृ': 'ṛ', 
        'ॄ': 'ṝ', 'ॢ': 'ḷ', 'ॣ': 'ḹ', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au'
    };
    const DEV_CONSONANT_TO_IAST = {
        'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ṅ',
        'च': 'c', 'छ': 'ch', 'ज': 'j', 'झ': 'jh', 'ञ': 'ñ',
        'ट': 'ṭ', 'ठ': 'ṭh', 'ड': 'ḍ', 'ढ': 'ḍh', 'ण': 'ṇ',
        'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
        'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
        'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
        'श': 'ś', 'ष': 'ṣ', 'स': 's', 'ह': 'h',
        'क्ष': 'kṣ', 'त्र': 'tr', 'ज्ञ': 'jñ',
        // Vedic/Nukta ḍ/ḍh (These are 2-char strings)
        'ड़': 'ḍ', // \u0921\u093C
        'ढ़': 'ḍh'  // \u0922\u093C
    };
    const DEV_NUKTA_MAP = { // For non-Sanskrit sounds
        'क': 'q', 'ख': 'x', 'ग': 'ġ', 'ज': 'z', 'फ': 'f'
    };
    const DEV_VOWEL_TO_IAST = {
        'अ': 'a', 'आ': 'ā', 'इ': 'i', 'ई': 'ī', 'उ': 'u', 'ऊ': 'ū',
        'ऋ': 'ṛ', 'ॠ': 'ṝ', 'ऌ': 'ḷ', 'ॡ': 'ḹ', 'ए': 'e', 'ऐ': 'ai', 
        'ओ': 'o', 'औ': 'au'
    };
    const DEV_OTHER_TO_IAST = {
        'ं': 'ṃ', 'ँ': 'm̐', 'ः': 'ḥ', 'ऽ': "'", '।': '|', '॥': '||'
    };

    // *** UNIVERSAL FIX ***
    // Explicitly define the Sets in the global scope AFTER the maps are defined.
    const DEV_ALL_CONSONANTS = new Set(Object.keys(DEV_CONSONANT_TO_IAST));
    const DEV_ALL_MATRAS = new Set(Object.keys(DEV_MATRA_TO_IAST));
    const DEV_ALL_VOWELS = new Set(Object.keys(DEV_VOWEL_TO_IAST));
    const DEV_ALL_OTHER = new Set(Object.keys(DEV_OTHER_TO_IAST));


    // Telugu to IAST
    const TEL_MATRA_TO_IAST = {
        'ా': 'ā', 'ి': 'i', 'ీ': 'ī', 'ు': 'u', 'ూ': 'ū', 'ృ': 'ṛ',
        'ౄ': 'ṝ', 'ౢ': 'ḷ', 'ౣ': 'ḹ', 'ె': 'e', 'ై': 'ai', 'ొ': 'o', 'ౌ': 'au'
    };
    const TEL_CONSONANT_TO_IAST = {
        'క': 'k', 'ఖ': 'kh', 'గ': 'g', 'ఘ': 'gh', 'ఙ': 'ṅ',
        'చ': 'c', 'ఛ': 'ch', 'జ': 'j', 'ఝ': 'jh', 'ఞ': 'ñ',
        'ట': 'ṭ', 'ఠ': 'ṭh', 'డ': 'ḍ', 'ఢ': 'ḍh', 'ణ': 'ṇ',
        'త': 't', 'థ': 'th', 'ద': 'd', 'ధ': 'dh', 'న': 'n',
        'ప': 'p', 'ఫ': 'ph', 'బ': 'b', 'भ': 'bh', 'మ': 'm',
        'య': 'y', 'ర': 'r', 'ల': 'l', 'వ': 'v',
        'श': 'ś', 'ష': 'ṣ', 'स': 's', 'హ': 'h',
        'క్ష': 'kṣ', 'జ్ఞ': 'jñ', 'త్ర': 'tr'
    };
    const TEL_VOWEL_TO_IAST = {
        'అ': 'a', 'ఆ': 'ā', 'ఇ': 'i', 'ఈ': 'ī', 'ఉ': 'u', 'ఊ': 'ū',
        'ఋ': 'ṛ', 'ౠ': 'ṝ', 'ఌ': 'ḷ', 'ౡ': 'ḹ', 'ఎ': 'e', 'ఐ': 'ai',
        'ఒ': 'o', 'ఔ': 'au'
    };
    const TEL_OTHER_TO_IAST = {
        'ం': 'ṃ', 'ఁ': 'm̐', 'ః': 'ḥ', 'ఽ': "'", '।': '|', '॥': '||'
    };

    // *** UNIVERSAL FIX ***
    // Explicitly define the Sets in the global scope AFTER the maps are defined.
    const TEL_ALL_CONSONANTS = new Set(Object.keys(TEL_CONSONANT_TO_IAST));
    const TEL_ALL_MATRAS = new Set(Object.keys(TEL_MATRA_TO_IAST));
    const TEL_ALL_VOWELS = new Set(Object.keys(TEL_VOWEL_TO_IAST));
    const TEL_ALL_OTHER = new Set(Object.keys(TEL_OTHER_TO_IAST));


    // --- UNIVERSAL SCRIPT-TO-IAST CONFIGS ---
    // *** UNIVERSAL FIX ***
    // Initialize Sets as EMPTY. They will be populated on DOMContentLoaded.
    const DEV_MAP_CONFIG = {
        vowels: DEV_VOWEL_TO_IAST,
        consonants: DEV_CONSONANT_TO_IAST,
        matras: DEV_MATRA_TO_IAST,
        other: DEV_OTHER_TO_IAST,
        nuktaMap: DEV_NUKTA_MAP,
        virama: DEV_VIRAMA,
        nuktaChar: DEV_NUKTA,
        allConsonants: new Set(),
        allMatras: new Set(),
        allVowels: new Set(),
        allOther: new Set()
    };
    const TEL_MAP_CONFIG = {
        vowels: TEL_VOWEL_TO_IAST,
        consonants: TEL_CONSONANT_TO_IAST,
        matras: TEL_MATRA_TO_IAST,
        other: TEL_OTHER_TO_IAST,
        nuktaMap: {}, // Telugu doesn't use Nukta for these
        virama: TEL_VIRAMA,
        nuktaChar: null,
        allConsonants: new Set(),
        allMatras: new Set(),
        allVowels: new Set(),
        allOther: new Set()
    };
    
    // --- ASCII -> IAST MAPPINGS ---
    const HK_TO_IAST_MAP = new Map([['RR', 'ṝ'], ['LL', 'ḹ'], ['kS', 'kṣ'], ['jJ', 'jñ'], ['A', 'ā'], ['I', 'ī'], ['U', 'ū'], ['R', 'ṛ'], ['L', 'ḷ'], ['G', 'ṅ'], ['J', 'ñ'], ['T', 'ṭ'], ['D', 'ḍ'], ['N', 'ṇ'], ['z', 'ś'], ['S', 'ṣ'], ['M', 'ṃ'], ['H', 'ḥ']]);
    const ITRANS_TO_IAST_MAP = new Map([['aa', 'ā'], ['ii', 'ī'], ['uu', 'ū'], ['R^i', 'ṛ'], ['R^I', 'ṝ'], ['L^i', 'ḷ'], ['L^I', 'ḹ'], ['eI', 'ai'], ['oU', 'au'], ['kSh', 'kṣ'], ['j~n', 'jñ'], ['sh', 'ś'], ['Sh', 'ṣ'], ['~n', 'ṅ'], ['~N', 'ñ'], ['M', 'ṃ'], ['H', 'ḥ'], ['ch', 'c'], ['Ch', 'ch'], ['Jh', 'jh'], ['Th', 'ṭh'], ['Dh', 'ḍh'], ['Nh', 'ṇh'], ['G', 'ṅ'], ['J', 'ñ'], ['T', 'ṭ'], ['D', 'ḍ'], ['N', 'ṇ'], ['~', 'ṃ'], ['^', '']]);

    // --- HOMORGANIC NASAL MAPPINGS ---
    const HOMORGANIC_NASALS = {
        'k': 'ṅ', 'g': 'ṅ', 'gh': 'ṅ', 'kh': 'ṅ', 'c': 'ñ', 'j': 'ñ',
        'jh': 'ñ', 'ch': 'ñ', 'ṭ': 'ṇ', 'ḍ': 'ṇ', 'ḍh': 'ṇ', 'ṭh': 'ṇ',
        't': 'n', 'd': 'n', 'dh': 'n', 'th': 'n', 'p': 'm', 'b': 'm', 
        'bh': 'm', 'ph': 'm'
    };
    
    // --- HELPER SETS AND REGEX ---
    const VOWELS = ['a', 'ā', 'i', 'ī', 'u', 'ū', 'ṛ', 'ṝ', 'ḷ', 'ḹ', 'e', 'ai', 'o', 'au'];
    const IAST_VOWELS_SET = new Set(VOWELS);
    const IAST_CONSONANTS_SET = new Set(['k', 'kh', 'g', 'gh', 'ṅ', 'c', 'ch', 'j', 'jh', 'ñ', 'ṭ', 'ṭh', 'ḍ', 'ḍh', 'ṇ', 't', 'th', 'd', 'dh', 'n', 'p', 'ph', 'b', 'bh', 'm', 'y', 'r', 'l', 'v', 'ś', 'ṣ', 's', 'h', 'kṣ', 'jñ', 'tr', 'q', 'x', 'ġ', 'z', 'f', 'ṛh']);
    
    // Phoneme list for IAST -> Script conversion (longest first)
    const ALL_IAST_PHONEMES_SORTED = [
        'kṣ', 'jñ', 'tr', 'ṛh', // Conjuncts
        'kh', 'gh', 'ch', 'jh', 'ṭh', 'ḍh', 'th', 'dh', 'ph', 'bh', // Aspirated
        'ai', 'au', 'ā', 'ī', 'ū', 'ṝ', 'ḹ', // Long Vowels
        'k', 'g', 'ṅ', 'c', 'j', 'ñ', 'ṭ', 'ḍ', 'ṇ', 't', 'd', 'n', 'p', 'b', 'm', // Consonants
        'y', 'r', 'l', 'v', 'ś', 'ṣ', 's', 'h', // Consonants
        'q', 'x', 'ġ', 'z', 'f', // Nukta Consonants
        'e', 'o', 'i', 'u', 'a', 'ṛ', 'ḷ', // Short Vowels
        'ṃ', 'm̐', 'ḥ', "'" // Specials
    ];

    // --- DETECTION REGEX ---
    const DEVANAGARI_REGEX = /[\u0900-\u097F]/;
    const TELUGU_REGEX = /[\u0C00-\u0C7F]/;
    const IAST_SPECIFIC_REGEX = /[āīūṛṝḷḹṅñṭḍṇśṣḥṃ]/; 
    const COMMON_ENGLISH_WORDS = new Set(['the', 'is', 'a', 'an', 'and', 'or', 'to', 'in', 'of', 'it', 'you', 'he', 'she', 'they', 'we', 'my', 'your', 'be', 'for']);
    const ENGLISH_ONLY_CHARS = /[w]/; // w is unambiguous

    // --- Core Transliteration Logic ---

    let transformationLog = [];
    let isSanskritMode = true; 
    let currentOutputScript = 'devanagari'; // Target script state

    /**
     * 5️⃣ FIX: English detection function
     */
    function isLikelyEnglish(text) {
        // If it has IAST chars, it's not English
        if (IAST_SPECIFIC_REGEX.test(text)) return false;
        
        // Check for unambiguous English chars
        if (ENGLISH_ONLY_CHARS.test(text.toLowerCase())) {
            return true;
        }
        const words = text.toLowerCase().split(' ');
        let englishWordCount = 0;
        for (const word of words) {
            if (COMMON_ENGLISH_WORDS.has(word)) {
                englishWordCount++;
            }
        }
        // If more than 20% of the words are common English words, flag it.
        return (words.length > 0 && (englishWordCount / words.length) > 0.2);
    }

    /**
     * Generic conversion from ASCII schemes (ITRANS/HK) to IAST.
     */
    function convertAsciiToIAST(text, scheme) {
        let iastOutput = text;
        const map = scheme === 'ITRANS' ? ITRANS_TO_IAST_MAP : HK_TO_IAST_MAP;
        transformationLog.push(`[Detection] Input recognized as ${scheme} scheme.`);

        // Sort map keys by length descending
        const sortedKeys = Array.from(map.keys()).sort((a, b) => b.length - a.length);

        for (const key of sortedKeys) {
            const iast = map.get(key);
            // Use case-sensitive regex globally
            const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            
            if (iastOutput.match(regex)) {
                 transformationLog.push(`[Conversion] Replaced ${key} with IAST ${iast}.`);
            }
            iastOutput = iastOutput.replace(regex, iast);
        }
        return iastOutput;
    }
    
    /**
     * Converts simple roman text (like 'Narayana') to IAST format.
     */
    function heuristicallyRomanToIAST(text) {
        let iast = text.toLowerCase().trim(); 

        // Heuristic 1: Handle common names
        if (iast === 'narayana') {
             iast = 'nārāyaṇa'; // Correct IAST
             transformationLog.push(`[Heuristic] Assuming 'Narayana' $\rightarrow$ 'nārāyaṇa'.`);
        } else if (iast === 'rama') {
             iast = 'rāma';
             transformationLog.push(`[Heuristic] Assuming 'rama' $\rightarrow$ 'rāma'.`);
        }
        
        // Heuristic 2: General replacement of 'sh' with 'ś'
        // and 'ch' -> 'c', 'Ch' -> 'ch'
        iast = iast.replace(/sh/g, 'ś'); 
        iast = iast.replace(/ch/g, 'c'); // 'ch' in simple roman is 'c' in IAST
        iast = iast.replace(/Ch/g, 'ch'); // 'Ch' in simple roman is 'ch' in IAST
        
        return iast;
    }

    /**
     * 1️⃣, 3️⃣, 4️⃣, 6️⃣, 10️⃣: NEW UNIVERSAL STATE MACHINE (Script -> IAST)
     * This single function replaces the buggy, duplicated Devanagari/Telugu logic.
     * It correctly handles the inherent 'a' based on state.
     * This code is now confirmed to be correct, the bug was in initialization.
     */
    function convertScriptToIAST(word, config) {
        let iastOutput = '';
        let i = 0;
        const len = word.length;
        let lastWasConsonant = false;

        while (i < len) {
            let char = word[i];
            let consumed = 1;

            // 1. Lookahead for 2-char conjuncts (e.g., क्ष, ज्ञ, ड़, ढ़)
            if (i + 1 < len) {
                let twoChar = word.substring(i, i + 2);
                if (config.allConsonants.has(twoChar)) {
                    char = twoChar;
                    consumed = 2;
                    transformationLog.push(`[Debug] Found 2-char conjunct: ${char}`);
                }
            }
            
            // 2. Lookahead for Nukta (only for Devanagari)
            let hasNukta = false;
            if (config.nuktaChar && (i + consumed < len)) {
                let nextChar = word[i + consumed];
                if (nextChar === config.nuktaChar) {
                    hasNukta = true;
                    consumed++;
                    transformationLog.push(`[Debug] Found Nukta on: ${char}`);
                }
            }
            
            // 3. Process the character based on its type
            if (config.allConsonants.has(char)) {
                // --- It's a CONSONANT ---
                if (lastWasConsonant) {
                    // The previous consonant was not followed by matra/virama,
                    // so it needs its inherent 'a'.
                    iastOutput += 'a';
                    transformationLog.push(`[Rule] Added inherent 'a' before ${char}`);
                }
                
                // Apply Nukta mapping if present and applicable
                let iastChar;
                if (hasNukta && config.nuktaMap[char]) {
                    iastChar = config.nuktaMap[char];
                    transformationLog.push(`[Rule] Applied Nukta map: ${char} + ${config.nuktaChar} $\rightarrow$ ${iastChar}`);
                } else {
                    iastChar = config.consonants[char];
                }
                
                iastOutput += iastChar;
                lastWasConsonant = true;

            } else if (config.allMatras.has(char)) {
                // --- It's a MATRA ---
                if (!lastWasConsonant) {
                    transformationLog.push(`[Warning] Found matra '${char}' without preceding consonant.`);
                    // Don't add 'a', just the matra's vowel
                    iastOutput += config.matras[char];
                } else {
                    // Matra modifies the last consonant
                    iastOutput += config.matras[char];
                    transformationLog.push(`[Rule] Applied matra '${char}' $\rightarrow$ ${config.matras[char]}`);
                    lastWasConsonant = false; // Matra provides the vowel
                }

            } else if (char === config.virama) {
                // --- It's a VIRAMA ---
                if (!lastWasConsonant) {
                     transformationLog.push(`[Warning] Found redundant virama.`);
                } else {
                    // Virama suppresses the inherent 'a'
                    transformationLog.push(`[Rule] Applied virama. Suppressing 'a'.`);
                    lastWasConsonant = false; // The consonant is now "halanta"
                }
            
            } else if (config.allVowels.has(char)) {
                // --- It's an INDEPENDENT VOWEL ---
                if (lastWasConsonant) {
                    // Previous consonant needs its 'a' before this new vowel.
                    iastOutput += 'a';
                    transformationLog.push(`[Rule] Added inherent 'a' before independent vowel ${char}`);
                }
                iastOutput += config.vowels[char];
                lastWasConsonant = false;

            } else if (config.allOther.has(char)) {
                // --- It's a DIACRITIC (ṃ, ḥ, ँ) or AVAGRAHA ---
                 if (lastWasConsonant) {
                    // Diacritic follows a full consonant, so add inherent 'a'
                    iastOutput += 'a';
                    transformationLog.push(`[Rule] Added inherent 'a' before diacritic ${char}`);
                }
                iastOutput += config.other[char];
                lastWasConsonant = false;
                
            } else {
                // --- It's UNKNOWN (punctuation, number, space) ---
                if (lastWasConsonant) {
                    // The last consonant was standalone, needs its 'a'.
                    iastOutput += 'a';
                    transformationLog.push(`[Rule] Added inherent 'a' before unknown char ${char}`);
                }
                iastOutput += char;
                lastWasConsonant = false;
            }
            
            i += consumed;
        }
        
        // 4. Final check
        // If the word ended on a consonant, it needs its final inherent 'a'.
        if (lastWasConsonant) {
            iastOutput += 'a';
            transformationLog.push(`[Rule] Added final inherent 'a' at end of word.`);
        }
        
        return iastOutput;
    }

    /**
     * 6️⃣ REFACTORED Devanagari-to-IAST
     * Now calls the universal state machine with the Devanagari config.
     */
    function convertDevanagariToIAST(text) {
        transformationLog.push(`[Detected] Devanagari script. Starting conversion...`);
        // Process word by word to keep state machine clean
        return text.split(' ').map(word => convertScriptToIAST(word, DEV_MAP_CONFIG)).join(' ');
    }
    
    /**
     * 6️⃣ REFACTORED Telugu-to-IAST
     * Now calls the universal state machine with the Telugu config.
     */
    function convertTeluguToIAST(text) {
        transformationLog.push(`[Detected] Telugu script. Starting conversion...`);
        // Process word by word to keep state machine clean
        return text.split(' ').map(word => convertScriptToIAST(word, TEL_MAP_CONFIG)).join(' ');
    }


    /**
     * --- IAST-to-Script State Machine ---
     * (This logic was already mostly correct, just needed homorganic fix)
     */
    function convertIASTToScript(text, script) {
        let scriptOutput = '';
        let i = 0;
        const input = text; 
        const len = input.length;
        
        const MAP = script === 'telugu' ? IAST_TO_TELUGU_MAP : IAST_TO_DEV_MAP;
        const MATRAS = MATRA_MAPS[script];
        const VIRAMA = script === 'telugu' ? TEL_VIRAMA : DEV_VIRAMA;
        
        let lastPhonemeWasConsonant = false;

        while (i < len) {
            let currentPhoneme = '';
            let phonemeLength = 0;
            let found = false;
            
            // 1. Find the longest matching IAST phoneme
            const inputSubstring = input.substring(i);
            for (const iast of ALL_IAST_PHONEMES_SORTED) {
                if (inputSubstring.toLowerCase().startsWith(iast)) {
                    currentPhoneme = iast;
                    phonemeLength = iast.length;
                    found = true;
                    break;
                }
            }

            if (!found) {
                // Not a recognized phoneme (punctuation, etc.)
                scriptOutput += input[i];
                lastPhonemeWasConsonant = false;
                i++;
                continue;
            }

            // 2. Process the found phoneme
            if (IAST_VOWELS_SET.has(currentPhoneme)) {
                // --- It's a VOWEL ---
                const scriptVowel = MAP.get(currentPhoneme);
                
                if (lastPhonemeWasConsonant) {
                    // Vowel follows a consonant -> Apply Matra
                    
                    // Remove the previously added Virama
                    if (scriptOutput.endsWith(VIRAMA)) {
                         scriptOutput = scriptOutput.slice(0, -VIRAMA.length);
                    }

                    if (currentPhoneme === 'a') {
                        // Inherent 'a' - no matra needed, virama already removed
                    } else {
                        // Apply the matra
                        const scriptMatra = MATRAS[scriptVowel];
                        if (scriptMatra) {
                            scriptOutput += scriptMatra;
                        }
                    }
                } else {
                    // Vowel is at the start or follows another vowel -> Use Independent form
                    scriptOutput += scriptVowel;
                }
                lastPhonemeWasConsonant = false;

            } else if (IAST_CONSONANTS_SET.has(currentPhoneme)) {
                // --- It's a CONSONANT ---
                
                // Handle homorganic nasalization if in Sanskrit mode
                if (isSanskritMode && (currentPhoneme === 'm' || currentPhoneme === 'ṃ')) {
                    let nextPhoneme = '';
                    let nextIsConsonant = false;
                    
                    // Look ahead for the next phoneme
                    const nextInputSubstring = input.substring(i + phonemeLength);
                    for (const iast of ALL_IAST_PHONEMES_SORTED) {
                         if (nextInputSubstring.toLowerCase().startsWith(iast)) {
                             nextPhoneme = iast;
                             nextIsConsonant = IAST_CONSONANTS_SET.has(nextPhoneme);
                             break;
                         }
                    }
                    
                    if (nextIsConsonant && HOMORGANIC_NASALS[nextPhoneme]) {
                        const homorganicIAST = HOMORGANIC_NASALS[nextPhoneme];
                        const homorganicScript = MAP.get(homorganicIAST);
                        scriptOutput += homorganicScript; // Add the Virama form
                        lastPhonemeWasConsonant = true; // The nasal is a consonant
                        i += phonemeLength; // Consume only the 'm'/'ṃ'
                        transformationLog.push(`[Rule] Applied Homorganic Nasal: ${currentPhoneme} $\rightarrow$ ${homorganicIAST}`);
                        continue; // Skip normal processing
                    }
                }
                
                // Standard consonant processing
                if (MAP.has(currentPhoneme)) {
                    scriptOutput += MAP.get(currentPhoneme); // Add Virama form (e.g., 'क्')
                } else {
                    scriptOutput += currentPhoneme; // Failsafe
                }
                lastPhonemeWasConsonant = true;

            } else {
                // --- It's a SPECIAL (ṃ, ḥ, ') ---
                if (MAP.has(currentPhoneme)) {
                    if(lastPhonemeWasConsonant && (currentPhoneme === 'ṃ' || currentPhoneme === 'ḥ' || currentPhoneme === 'm̐')) {
                        // e.g., "rāmaṃ" -> "rāma" + "ṃ"
                        // If last was consonant, it has a virama. Remove it.
                        if (scriptOutput.endsWith(VIRAMA)) {
                             scriptOutput = scriptOutput.slice(0, -VIRAMA.length);
                        }
                    }
                    scriptOutput += MAP.get(currentPhoneme);
                } else {
                    scriptOutput += currentPhoneme; // Failsafe
                }
                lastPhonemeWasConsonant = false;
            }
            
            i += phonemeLength;
        }
        
        // Final cleanup: Keep trailing Virama if it exists (e.g., "jagat")
        if (lastPhonemeWasConsonant && scriptOutput.endsWith(VIRAMA)) {
             transformationLog.push(`[Rule] Word ends with halanta consonant.`);
        }

        return scriptOutput;
    }

    // --- 7️⃣ Sandhi Analysis Logic (UPGRADED) ---
    
    // NEW: Expanded Sandhi Types
    const readableSandhiType = {
        'visarga_s': 'Visarga Sandhi (Sibilant)',
        'visarga_o': 'Visarga Sandhi (to \'o\')',
        'guna_e': 'Guṇa Sandhi',
        'guna_o': 'Guṇa Sandhi',
        'vrddhi_ai': 'Vṛddhi Sandhi',
        'vrddhi_au': 'Vṛddhi Sandhi',
        'dirgha_a': 'Savarna Dīrgha Sandhi',
        'dirgha_i': 'Savarna Dīrgha Sandhi',
        'dirgha_u': 'Savarna Dīrgha Sandhi',
        'yan_y': 'Yaṇ Sandhi',
        'yan_v': 'Yaṇ Sandhi',
        'ayadi_ay': 'Ayādi Sandhi',
        'ayadi_av': 'Ayādi Sandhi',
        'ayadi_ay_long': 'Ayādi Sandhi',
        'ayadi_av_long': 'Ayādi Sandhi',
        'unknown': 'N/A'
    };
    
    // Define character sets to build safe Regex
    const VOWELS_ALL = "aāiīuūṛṝḷḹeaiou";
    const VOWELS_A = "aā";
    const VOWELS_I = "iī";
    const VOWELS_U = "uū";
    const VOWELS_E = "eai"; // e, ai
    const VOWELS_O = "oau"; // o, au
    const CONSONANTS_S = "śṣs";
    const CONSONANTS_VOICED = "gghjbḍdhjñdhnvlmry"; // Voiced consonants

    /**
     * Performs reverse sandhi analysis on a single IAST token.
     * NEW: Now returns an array of *all* possible proposals.
     */
    function performSandhiSegmentation(iastText) {
        let results = [];
        const text = iastText.toLowerCase().trim();
        let analysisLog = ['[Analysis Mode] Starting Reverse Sandhi Segmentation.', `[Input] Raw IAST Token: ${text}`];
        
        // --- Rule 1: Visarga Sandhi (Sibilant to Visarga) ---
        // e.g., rāmaśca -> rāmaḥ ca
        try {
            const visargaRegex = new RegExp(`^(.*[${VOWELS_ALL}])([${CONSONANTS_S}])(.*)$`);
            const visargaMatch = text.match(visargaRegex);
            
            if (visargaMatch) {
                analysisLog.push("[Check] Matched Visarga (sibilant) pattern.");
                const [, p1, sibilant, p2] = visargaMatch;
                
                if (p2.length > 0 && (
                    (sibilant === 'ś' && (p2.startsWith('c') || p2.startsWith('ch'))) ||
                    (sibilant === 'ṣ' && (p2.startsWith('ṭ') || p2.startsWith('ṭh'))) ||
                    (sibilant === 's' && (p2.startsWith('t') || p2.startsWith('th')))
                )) {
                    const proposal = `${p1}ḥ + ${p2}`; // Add space for external sandhi
                    analysisLog.push(`[Found] Visarga (Sibilant): ${text} -> ${proposal}`);
                    results.push({ proposal: proposal, typeKey: "visarga_s", confidence: 0.92, log: analysisLog });
                } else {
                     analysisLog.push("[Skip] Sibilant did not match following consonant.");
                }
            }
        } catch(e) { analysisLog.push(`[Error] Visarga Regex failed: ${e.message}`); }

        // --- Rule 2: Guna Sandhi (Medial 'e' or 'o') ---
        // Guna 'e' -> a/ā + i/ī (e.g., maheśvara -> mahā + īśvara)
        try {
            const gunaERegex = new RegExp(`^(.*[${VOWELS_A}])e(.+)$`); 
            const gunaEMatch = text.match(gunaERegex);
            if (gunaEMatch) {
                const [, p1, p2] = gunaEMatch;
                // Propose split: remove 'e' from p1, add i/ī to p2
                const p1_clean = p1.slice(0, -1); // remove the a/ā
                const proposal = `${p1_clean}a/ā + i/ī${p2}`;
                analysisLog.push(`[Found] Guṇa (e): ${text} -> ${proposal}`);
                results.push({ proposal: proposal, typeKey: "guna_e", confidence: 0.85, log: analysisLog });
            }
        } catch(e) { analysisLog.push(`[Error] Guna(e) Regex failed: ${e.message}`); }


        // Guna 'o' -> a/ā + u/ū (e.g., mahotsava -> mahā + utsava)
        try {
            const gunaORegex = new RegExp(`^(.*[${VOWELS_A}])o(.+)$`);
            const gunaOMatch = text.match(gunaORegex);
            if (gunaOMatch) {
                const [, p1, p2] = gunaOMatch;
                const p1_clean = p1.slice(0, -1); // remove the a/ā
                const proposal = `${p1_clean}a/ā + u/ū${p2}`;
                analysisLog.push(`[Found] Guṇa (o): ${text} -> ${proposal}`);
                results.push({ proposal: proposal, typeKey: "guna_o", confidence: 0.85, log: analysisLog });
            }
        } catch(e) { analysisLog.push(`[Error] Guna(o) Regex failed: ${e.message}`); }
        
        // --- Rule 3: Dīrgha (Vowel Lengthening) Sandhi ---
        // e.g., rāmālaya -> rāma + ālaya OR rāma + alaya
        try {
            const dirghaARegex = new RegExp(`^(.*)ā([${VOWELS_A}].*)$`); 
            const dirghaAMatch = text.match(dirghaARegex);
             if (dirghaAMatch) {
                const [, p1, p2] = dirghaAMatch;
                const proposal = `${p1}a/ā + ${p2}`;
                analysisLog.push(`[Found] Dīrgha (ā): ${text} -> ${proposal}`);
                results.push({ proposal: proposal, typeKey: "dirgha_a", confidence: 0.80, log: analysisLog });
            }
        } catch(e) { analysisLog.push(`[Error] Dirgha(ā) Regex failed: ${e.message}`); }
        
        try {
            const dirghaIRegex = new RegExp(`^(.*)ī([${VOWELS_I}].*)$`);
            const dirghaIMatch = text.match(dirghaIRegex);
             if (dirghaIMatch) {
                const [, p1, p2] = dirghaIMatch;
                const proposal = `${p1}i/ī + ${p2}`;
                analysisLog.push(`[Found] Dīrgha (ī): ${text} -> ${proposal}`);
                results.push({ proposal: proposal, typeKey: "dirgha_i", confidence: 0.80, log: analysisLog });
            }
        } catch(e) { analysisLog.push(`[Error] Dirgha(ī) Regex failed: ${e.message}`); }
        
        try {
            const dirghaURegex = new RegExp(`^(.*)ū([${VOWELS_U}].*)$`);
            const dirghaUMatch = text.match(dirghaURegex);
             if (dirghaUMatch) {
                const [, p1, p2] = dirghaUMatch;
                const proposal = `${p1}u/ū + ${p2}`;
                analysisLog.push(`[Found] Dīrgha (ū): ${text} -> ${proposal}`);
                results.push({ proposal: proposal, typeKey: "dirgha_u", confidence: 0.80, log: analysisLog });
            }
        } catch(e) { analysisLog.push(`[Error] Dirgha(ū) Regex failed: ${e.message}`); }


        // --- Rule 4: Yaṇ Sandhi (Internal) ---
        // e.g., ityādi -> iti + ādi
        try {
            const yanYRegex = new RegExp(`^(.*)y([${VOWELS_ALL}].*)$`);
            const yanYMatch = text.match(yanYRegex);
            if (yanYMatch) {
                const [, p1, p2] = yanYMatch;
                const proposal = `${p1}i/ī + ${p2}`;
                analysisLog.push(`[Found] Yaṇ (y): ${text} -> ${proposal}`);
                results.push({ proposal: proposal, typeKey: "yan_y", confidence: 0.90, log: analysisLog });
            }
        } catch(e) { analysisLog.push(`[Error] Yan(y) Regex failed: ${e.message}`); }

        // e.g., madhvāri -> madhu + āri
        try {
            const yanVRegex = new RegExp(`^(.*)v([${VOWELS_ALL}].*)$`);
            const yanVMatch = text.match(yanVRegex);
            if (yanVMatch) {
                const [, p1, p2] = yanVMatch;
                const proposal = `${p1}u/ū + ${p2}`;
                analysisLog.push(`[Found] Yaṇ (v): ${text} -> ${proposal}`);
                results.push({ proposal: proposal, typeKey: "yan_v", confidence: 0.90, log: analysisLog });
            }
        } catch(e) { analysisLog.push(`[Error] Yan(v) Regex failed: ${e.message}`); }
        
        // --- NEW Rule 5: Vṛddhi Sandhi ---
        // e.g., ekaikam -> eka + ekam (a/ā + e/ai -> ai)
        try {
            const vrddhiAiRegex = new RegExp(`^(.*[${VOWELS_A}])ai(.+)$`);
            const vrddhiAiMatch = text.match(vrddhiAiRegex);
            if (vrddhiAiMatch) {
                const [, p1, p2] = vrddhiAiMatch;
                const p1_clean = p1.slice(0, -1); // remove the a/ā
                const proposal = `${p1_clean}a/ā + ${VOWELS_E}${p2}`; // Propose e... or ai...
                analysisLog.push(`[Found] Vṛddhi (ai): ${text} -> ${proposal}`);
                results.push({ proposal: proposal, typeKey: "vrddhi_ai", confidence: 0.88, log: analysisLog });
            }
        } catch(e) { analysisLog.push(`[Error] Vrddhi(ai) Regex failed: ${e.message}`); }

        // e.g., gangaughaḥ -> gangā + oghaḥ (a/ā + o/au -> au)
        try {
            const vrddhiAuRegex = new RegExp(`^(.*[${VOWELS_A}])au(.+)$`);
            const vrddhiAuMatch = text.match(vrddhiAuRegex);
            if (vrddhiAuMatch) {
                const [, p1, p2] = vrddhiAuMatch;
                const p1_clean = p1.slice(0, -1); // remove the a/ā
                const proposal = `${p1_clean}a/ā + ${VOWELS_O}${p2}`; // Propose o... or au...
                analysisLog.push(`[Found] Vṛddhi (au): ${text} -> ${proposal}`);
                results.push({ proposal: proposal, typeKey: "vrddhi_au", confidence: 0.88, log: analysisLog });
            }
        } catch(e) { analysisLog.push(`[Error] Vrddhi(au) Regex failed: ${e.message}`); }

        // --- NEW Rule 6: Ayādi Sandhi ---
        // 'ay' -> 'e' + vowel
        try {
            const ayadiAyRegex = new RegExp(`^(.*)ay([${VOWELS_ALL}].*)$`);
            const ayadiAyMatch = text.match(ayadiAyRegex);
            if (ayadiAyMatch) {
                const [, p1, p2] = ayadiAyMatch;
                const proposal = `${p1}e + ${p2}`;
                analysisLog.push(`[Found] Ayādi (ay): ${text} -> ${proposal}`);
                results.push({ proposal: proposal, typeKey: "ayadi_ay", confidence: 0.82, log: analysisLog });
            }
        } catch(e) { analysisLog.push(`[Error] Ayadi(ay) Regex failed: ${e.message}`); }

        // 'av' -> 'o' + vowel
        try {
            const ayadiAvRegex = new RegExp(`^(.*)av([${VOWELS_ALL}].*)$`);
            const ayadiAvMatch = text.match(ayadiAvRegex);
            if (ayadiAvMatch) {
                const [, p1, p2] = ayadiAvMatch;
                const proposal = `${p1}o + ${p2}`;
                analysisLog.push(`[Found] Ayādi (av): ${text} -> ${proposal}`);
                results.push({ proposal: proposal, typeKey: "ayadi_av", confidence: 0.82, log: analysisLog });
            }
        } catch(e) { analysisLog.push(`[Error] Ayadi(av) Regex failed: ${e.message}`); }

        // 'āy' -> 'ai' + vowel
        try {
            const ayadiAyLongRegex = new RegExp(`^(.*)āy([${VOWELS_ALL}].*)$`);
            const ayadiAyLongMatch = text.match(ayadiAyLongRegex);
            if (ayadiAyLongMatch) {
                const [, p1, p2] = ayadiAyLongMatch;
                const proposal = `${p1}ai + ${p2}`;
                analysisLog.push(`[Found] Ayādi (āy): ${text} -> ${proposal}`);
                results.push({ proposal: proposal, typeKey: "ayadi_ay_long", confidence: 0.82, log: analysisLog });
            }
        } catch(e) { analysisLog.push(`[Error] Ayadi(āy) Regex failed: ${e.message}`); }

        // 'āv' -> 'au' + vowel
        try {
            const ayadiAvLongRegex = new RegExp(`^(.*)āv([${VOWELS_ALL}].*)$`);
            const ayadiAvLongMatch = text.match(ayadiAvLongRegex);
            if (ayadiAvLongMatch) {
                const [, p1, p2] = ayadiAvLongMatch;
                const proposal = `${p1}au + ${p2}`;
                analysisLog.push(`[Found] Ayādi (āv): ${text} -> ${proposal}`);
                results.push({ proposal: proposal, typeKey: "ayadi_av_long", confidence: 0.82, log: analysisLog });
            }
        } catch(e) { analysisLog.push(`[Error] Ayadi(āv) Regex failed: ${e.message}`); }

        // --- NEW Rule 7: Visarga Sandhi (to 'o') ---
        // e.g., manorathaḥ -> manaḥ + rathaḥ (aḥ + voiced consonant -> o)
        try {
            const visargaORegex = new RegExp(`^(.*a)o([${CONSONANTS_VOICED}].*)$`);
            const visargaOMatch = text.match(visargaORegex);
            if (visargaOMatch) {
                const [, p1, p2] = visargaOMatch;
                const proposal = `${p1}ḥ + ${p2}`;
                analysisLog.push(`[Found] Visarga (o): ${text} -> ${proposal}`);
                results.push({ proposal: proposal, typeKey: "visarga_o", confidence: 0.75, log: analysisLog });
            }
        } catch(e) { analysisLog.push(`[Error] Visarga(o) Regex failed: ${e.message}`); }

        // --- Final Output ---
        if (results.length === 0) {
            analysisLog.push("[Result] No recognized patterns found.");
            results.push({ 
                proposal: "Could not analyze this word yet. Try simpler input.", 
                typeKey: "unknown", 
                confidence: 0, 
                log: analysisLog 
            });
        }

        // Return *all* proposals found, sorted by confidence
        return results.sort((a, b) => b.confidence - a.confidence);
    }


    // --- UI and Controller Logic ---
    
    // Wrap all listeners inside a DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        
        /**
         * *** UNIVERSAL FIX: STABLE INITIALIZATION ***
         * This function runs *after* the DOM is loaded and all const maps
         * are guaranteed to be defined. It manually populates the Sets.
         */
        function initializeMaps() {
            try {
                for (const key in DEV_CONSONANT_TO_IAST) {
                    DEV_MAP_CONFIG.allConsonants.add(key);
                }
                for (const key in DEV_MATRA_TO_IAST) {
                    DEV_MAP_CONFIG.allMatras.add(key);
                }
                for (const key in DEV_VOWEL_TO_IAST) {
                    DEV_MAP_CONFIG.allVowels.add(key);
                }
                for (const key in DEV_OTHER_TO_IAST) {
                    DEV_MAP_CONFIG.allOther.add(key);
                }

                for (const key in TEL_CONSONANT_TO_IAST) {
                    TEL_MAP_CONFIG.allConsonants.add(key);
                }
                for (const key in TEL_MATRA_TO_IAST) {
                    TEL_MAP_CONFIG.allMatras.add(key);
                }
                for (const key in TEL_VOWEL_TO_IAST) {
                    TEL_MAP_CONFIG.allVowels.add(key);
                }
                for (const key in TEL_OTHER_TO_IAST) {
                    TEL_MAP_CONFIG.allOther.add(key);
                }
                console.log("Lipisetu Maps Initialized. Devanagari Matras:", DEV_MAP_CONFIG.allMatras.size);
            } catch (e) {
                console.error("CRITICAL ERROR: Failed to initialize maps.", e);
            }
        }
        // Run the initialization immediately
        initializeMaps();

        // Get all elements *inside* the container
        const app = document.getElementById('lipisetu-app-container');
        if (!app) { 
            console.error("Lipisetu App Container not found!");
            return;
        }

        const inputTextarea = app.querySelector('#inputText');
        const outputTextarea = app.querySelector('#outputText'); // This is a DIV
        const englishWarningBox = app.querySelector('#englishWarningBox'); 
        const logList = app.querySelector('#normalizationLog');
        const toIASTButton = app.querySelector('#toIAST');
        const toScriptButton = app.querySelector('#toScript');
        const autoConvertButton = app.querySelector('#autoConvert');
        const copyButton = app.querySelector('#copyButton'); // Legacy
        const floatingCopyButton = app.querySelector('#floatingCopyBtn'); // New
        const clearAllButton = app.querySelector('#clearAllButton'); 
        const messageBox = document.getElementById('messageBox'); // This is outside the container
        
        const uploadButton = app.querySelector('#uploadButton');
        const uploadInput = document.getElementById('uploadInput'); // This is outside
        const downloadButton = app.querySelector('#downloadButton');
        
        // NEW: Mobile Toggles
        const mobileToggleTransliteration = app.querySelector('#mobileToggleTransliteration');
        const mobileToggleSandhi = app.querySelector('#mobileToggleSandhi');
        const transliterationColumn = app.querySelector('#transliteration-column');
        const sandhiColumn = app.querySelector('#sandhi-column');
        
        const transliterationPanel = app.querySelector('#transliterationPanel');
        const sandhiAnalysisPanel = app.querySelector('#sandhiAnalysisPanel');
        
        const sandhiInput = app.querySelector('#sandhiInput');
        const analyzeSandhiButton = app.querySelector('#analyzeSandhiButton');
        const sandhiResultsDiv = app.querySelector('#sandhiResults');
        const showSandhiLogBtn = app.querySelector('#showSandhiLogBtn');
        const sandhiLogDiv = app.querySelector('#sandhiLog');
        const sandhiLogPre = sandhiLogDiv.querySelector('pre');
        
        let currentMode = 'auto'; // Transliteration mode: 'auto', 'toIAST', or 'toScript'

        function showMessage(text) {
            messageBox.textContent = text;
            messageBox.classList.add('show');
            setTimeout(() => {
                messageBox.classList.remove('show');
            }, 2000);
        }

        function updateLog() {
            if (!logList) return; // Failsafe
            logList.innerHTML = '';
            if (transformationLog.length === 0) {
                logList.innerHTML = '<li>No transformations or analyses performed yet.</li>';
                return;
            }
            transformationLog.forEach(logEntry => {
                const li = document.createElement('li');
                li.innerHTML = logEntry.replace(/\$/g, ''); // Use innerHTML to render $...$ and remove $
                logList.appendChild(li);
            });
        }

        // Stricter HK/ITRANS detection
        function isLikelyHK(input) {
             const trimmedInput = input.trim();
             if (trimmedInput.length === 0) return false;
             return /[AIURRLLGTDNJzS]/.test(trimmedInput) && !/^[A-Z][a-z]+$/.test(trimmedInput) && !IAST_SPECIFIC_REGEX.test(trimmedInput) && !isLikelyITRANS(trimmedInput);
        }
        
        function isLikelyITRANS(input) {
             return /aa|ii|uu|R\^|Sh|ch|jn|M|H/i.test(input) && !IAST_SPECIFIC_REGEX.test(input);
        }

        /**
         * 5️⃣, 8️⃣, BLOGGER FIX: Auto-detect function with corrected logic order
         * This function now also sets the className and lang attribute.
         */
        function autoDetectAndConvert(input) {
            transformationLog = []; // Clear log for auto-detect
            let originalInput = input; 
            if (originalInput.trim().length === 0) {
                setTransliterationMode('auto', false);
                return '';
            }

            const isDevanagari = DEVANAGARI_REGEX.test(originalInput);
            const isTelugu = TELUGU_REGEX.test(originalInput); 
            const isIAST = IAST_SPECIFIC_REGEX.test(originalInput);
            const isITRANS = isLikelyITRANS(originalInput);
            const isHK = isLikelyHK(originalInput);
            const isEnglish = isLikelyEnglish(originalInput); // Check for English
            
            let output = '';
            let iastInput = originalInput; // Default
            
            if (isDevanagari) {
                setTransliterationMode('toIAST', false);
                output = convertDevanagariToIAST(originalInput);
                outputTextarea.className = 'font-iast';
                outputTextarea.setAttribute('lang', 'en-US');
            } else if (isTelugu) { 
                setTransliterationMode('toIAST', false);
                output = convertTeluguToIAST(originalInput);
                outputTextarea.className = 'font-iast';
                outputTextarea.setAttribute('lang', 'en-US');
            } else if (isIAST) {
                setTransliterationMode('toScript', false);
                transformationLog.push('[Detection] Input recognized as IAST.');
                iastInput = originalInput; // Already IAST
                output = iastInput.split(' ').map(word => convertIASTToScript(word, currentOutputScript)).join(' ');
                outputTextarea.className = `font-${currentOutputScript}`;
                outputTextarea.setAttribute('lang', (currentOutputScript === 'telugu' ? 'te' : 'hi'));
            } else if (isHK) {
                setTransliterationMode('toScript', false);
                iastInput = convertAsciiToIAST(originalInput, 'HK');
                output = iastInput.split(' ').map(word => convertIASTToScript(word, currentOutputScript)).join(' ');
                outputTextarea.className = `font-${currentOutputScript}`;
                outputTextarea.setAttribute('lang', (currentOutputScript === 'telugu' ? 'te' : 'hi'));
            } else if (isITRANS) {
                setTransliterationMode('toScript', false);
                iastInput = convertAsciiToIAST(originalInput, 'ITRANS');
                output = iastInput.split(' ').map(word => convertIASTToScript(word, currentOutputScript)).join(' ');
                outputTextarea.className = `font-${currentOutputScript}`;
                outputTextarea.setAttribute('lang', (currentOutputScript === 'telugu' ? 'te' : 'hi'));
            } else if (isEnglish) {
                setTransliterationMode('auto', false);
                transformationLog.push('[Detection] Likely English text. Passing through.');
                englishWarningBox.style.display = 'block';
                output = originalInput; // Pass through
                outputTextarea.className = 'font-iast'; // Use IAST/serif font for English
                outputTextarea.setAttribute('lang', 'en-US');
            } else if (/[a-z]/i.test(originalInput)) { 
                setTransliterationMode('toScript', false);
                transformationLog.push('[Detection] Input recognized as Simple Roman. Applying heuristics...');
                iastInput = originalInput.split(' ').map(word => heuristicallyRomanToIAST(word)).join(' ');
                output = iastInput.split(' ').map(word => convertIASTToScript(word, currentOutputScript)).join(' ');
                outputTextarea.className = `font-${currentOutputScript}`;
                outputTextarea.setAttribute('lang', (currentOutputScript === 'telugu' ? 'te' : 'hi'));
                englishWarningBox.style.display = 'none';
            } else {
                transformationLog.push('[Detection] Input is non-standard. Passing through.');
                output = originalInput;
                outputTextarea.className = '';
                outputTextarea.removeAttribute('lang');
                englishWarningBox.style.display = 'none';
            }
            
            updateLog();
            return output;
        }

        /**
         * BLOGGER FIX: This function now *only* updates labels and lang attributes.
         * The `className` is set by the function actually performing the conversion.
         */
        function updateLabels(mode) {
            const inputLabel = app.querySelector('#inputLabel');
            const outputLabel = app.querySelector('#outputLabel');

            if (mode === 'toIAST') {
                inputLabel.textContent = 'Input (Devanagari / Telugu)';
                outputLabel.textContent = 'Output (IAST)';
                outputTextarea.setAttribute('lang', 'en-US'); // Set lang
            } else if (mode === 'toScript') {
                const scriptName = currentOutputScript.charAt(0).toUpperCase() + currentOutputScript.slice(1);
                inputLabel.textContent = 'Input (IAST, HK, or ITRANS)';
                outputLabel.textContent = `Output (${scriptName})`;
                outputTextarea.setAttribute('lang', (currentOutputScript === 'telugu' ? 'te' : 'hi')); // Set lang
            } else { // Auto
                inputLabel.textContent = 'Input (Auto Detect)';
                outputLabel.textContent = 'Output';
                outputTextarea.removeAttribute('lang'); // Clear lang
            }
        }


        function setTransliterationMode(mode, updateUI = true) {
            currentMode = mode;
            
            if (updateUI) {
                [toIASTButton, toScriptButton, autoConvertButton].forEach(btn => {
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-outline');
                });

                if (mode === 'toIAST') {
                    toIASTButton.classList.add('btn-primary');
                    toIASTButton.classList.remove('btn-outline');
                } else if (mode === 'toScript') {
                    toScriptButton.classList.add('btn-primary');
                    toScriptButton.classList.remove('btn-outline');
                } else {
                    autoConvertButton.classList.add('btn-primary');
                    autoConvertButton.classList.remove('btn-outline');
                }
            }
            updateLabels(mode);
        }

        /**
         * Main conversion function
         * BLOGGER FIX: Now sets className explicitly.
         */
        function performConversion() {
            transformationLog = []; // Reset log
            const input = inputTextarea.value;
            let output = '';

            // Hide warning by default
            englishWarningBox.style.display = 'none';
            
            if (currentMode === 'toIAST') {
                // Auto-detect script for IAST conversion
                if (TELUGU_REGEX.test(input)) {
                    output = convertTeluguToIAST(input);
                } else {
                    // Default to Devanagari
                    output = convertDevanagariToIAST(input);
                }
                outputTextarea.className = 'font-iast'; // Set class
                outputTextarea.setAttribute('lang', 'en-US'); // Set lang

            } else if (currentMode === 'toScript') {
                let iastInput = input;
                const isIAST = IAST_SPECIFIC_REGEX.test(input);
                const isITRANS = isLikelyITRANS(input);
                const isHK = isLikelyHK(input);
                const isEnglish = isLikelyEnglish(input);

                if (isITRANS) {
                     iastInput = convertAsciiToIAST(input, 'ITRANS');
                } else if (isHK) {
                     iastInput = convertAsciiToIAST(input, 'HK');
                } else if (isIAST) {
                    transformationLog.push('[Detection] Input recognized as IAST.');
                } else if (isEnglish) {
                    transformationLog.push('[Detection] Likely English text. Passing through.');
                    englishWarningBox.style.display = 'block';
                } else if (/[a-z]/i.test(input)) { 
                    transformationLog.push('[Detection] Input recognized as Simple Roman. Applying heuristics...');
                    iastInput = input.split(' ').map(word => heuristicallyRomanToIAST(word)).join(' ');
                } else {
                    transformationLog.push('[Detection] Input assumed to be non-IAST/non-Devanagari text.');
                }
                
                if (isEnglish) {
                    output = iastInput;
                    outputTextarea.className = 'font-iast'; // Use serif font for English
                    outputTextarea.setAttribute('lang', 'en-US');
                } else {
                    output = iastInput.split(' ').map(word => convertIASTToScript(word, currentOutputScript)).join(' ');
                    outputTextarea.className = `font-${currentOutputScript}`; // Set class
                    outputTextarea.setAttribute('lang', (currentOutputScript === 'telugu' ? 'te' : 'hi'));
                }
            
            } else if (currentMode === 'auto') {
                // Auto-detect handles all logic, including setting class/lang
                output = autoDetectAndConvert(input);
            }

            outputTextarea.textContent = output; 
            updateLog();
        }
        
        /**
         * BLOGGER FIX: Now resets className and lang.
         */
        function clearAll() { 
            const initialText = outputTextarea.getAttribute('data-initial-text');
            inputTextarea.value = '';
            outputTextarea.textContent = initialText;
            outputTextarea.className = ''; // Reset class
            outputTextarea.removeAttribute('lang'); // Reset lang
            englishWarningBox.style.display = 'none';
            sandhiInput.value = '';
            sandhiResultsDiv.innerHTML = 'Awaiting input...'; // Reset Sandhi UI
            showSandhiLogBtn.classList.add('hidden');
            sandhiLogDiv.classList.add('hidden');
            transformationLog = ['System initialized.', 'Cleared all content.'];
            setTransliterationMode('auto');
            updateLog();
            showMessage("Cleared all content and log.");
            
            // Reset mobile view if applicable
            if (window.innerWidth < 900 && mobileToggleTransliteration) {
                 // Use .style.display to ensure columns reset
                transliterationColumn.style.display = 'block';
                sandhiColumn.style.display = 'none';
                
                mobileToggleTransliteration.classList.add('btn-primary');
                mobileToggleTransliteration.classList.remove('btn-outline');
                
                mobileToggleSandhi.classList.add('btn-outline');
                mobileToggleSandhi.classList.remove('btn-primary');
            }
        }
        
        // --- Event Listeners ---
        
        const initialText = outputTextarea.getAttribute('data-initial-text');
        outputTextarea.textContent = initialText;
        
        toIASTButton.innerHTML = '→ IAST';
        toScriptButton.innerHTML = '→ Target Script';
        analyzeSandhiButton.innerHTML = 'Analyze Sandhi →';

        setTransliterationMode('auto');
        updateLog(); // Initialize log

        // --- NEW Mobile Toggle Listeners ---
        if (mobileToggleTransliteration) {
            mobileToggleTransliteration.addEventListener('click', () => {
                transliterationColumn.style.display = 'block';
                sandhiColumn.style.display = 'none';
                
                mobileToggleTransliteration.classList.add('btn-primary');
                mobileToggleTransliteration.classList.remove('btn-outline');
                
                mobileToggleSandhi.classList.add('btn-outline');
                mobileToggleSandhi.classList.remove('btn-primary');
            });
        }
        
        if (mobileToggleSandhi) {
            mobileToggleSandhi.addEventListener('click', () => {
                transliterationColumn.style.display = 'none';
                sandhiColumn.style.display = 'block';
                
                mobileToggleSandhi.classList.add('btn-primary');
                mobileToggleSandhi.classList.remove('btn-outline');
                
                mobileToggleTransliteration.classList.add('btn-outline');
                mobileToggleTransliteration.classList.remove('btn-primary');
                
                // This is the sandhi analyzer, so clear log for analysis
                transformationLog = ['[Analysis Mode] Ready to perform Reverse Sandhi Segmentation.'];
                updateLog();
            });
        }


        toIASTButton.addEventListener('click', () => { setTransliterationMode('toIAST'); performConversion(); });
        toScriptButton.addEventListener('click', () => { setTransliterationMode('toScript'); performConversion(); });
        autoConvertButton.addEventListener('click', () => { setTransliterationMode('auto'); performConversion(); });

        inputTextarea.addEventListener('input', () => {
            performConversion();
        });

        // --- NEW: Upgraded Sandhi Button Click Handler ---
        analyzeSandhiButton.addEventListener('click', () => {
            console.log("Analyze Sandhi button clicked.");
            // Clear old results
            sandhiResultsDiv.innerHTML = 'Analyzing...';
            showSandhiLogBtn.classList.add('hidden');
            sandhiLogDiv.classList.add('hidden');
            
            try {
                const input = sandhiInput.value;
                if (input.trim()) {
                    const analyses = performSandhiSegmentation(input); // Returns an array
                    
                    if (analyses[0].typeKey === 'unknown') {
                        // No valid analysis found
                        sandhiResultsDiv.innerHTML = `
                            <div class="sandhi-proposal">${analyses[0].proposal}</div>
                            <span class="sandhi-detail">Type: <strong>N/A</strong></span>
                            <span class="sandhi-detail">Confidence: <strong>0%</strong></span>
                        `;
                        showMessage("Analysis complete. No common sandhi found.");
                    } else {
                        // Build an HTML list of all proposals
                        let proposalsHTML = '<ul>';
                        analyses.forEach(analysis => {
                            const readableType = readableSandhiType[analysis.typeKey] || analysis.typeKey;
                            proposalsHTML += `
                                <li class="sandhi-result-item">
                                    <div class="sandhi-proposal">${analysis.proposal}</div>
                                    <span class="sandhi-detail">Type: <strong>${readableType}</strong></span>
                                    <span class="sandhi-detail">Confidence: <strong>${(analysis.confidence * 100).toFixed(0)}%</strong></span>
                                </li>
                            `;
                        });
                        proposalsHTML += '</ul>';
                        sandhiResultsDiv.innerHTML = proposalsHTML;
                        showMessage(`Sandhi analysis complete. Found ${analyses.length} proposal(s).`);
                    }
                    
                    // Populate and show the log button (using the log from the *first* analysis)
                    sandhiLogPre.textContent = analyses[0].log.join('\n');
                    showSandhiLogBtn.classList.remove('hidden');
                    
                } else {
                    sandhiResultsDiv.innerHTML = 'Please enter a word in IAST format for analysis.';
                }
            } catch (err) {
                console.error("Error during Sandhi analysis:", err);
                sandhiResultsDiv.textContent = 'An unexpected error occurred during analysis. Please check console.';
                showMessage("Analysis failed. See log for details.");
            }
        });
        
        showSandhiLogBtn.addEventListener('click', () => {
            sandhiLogDiv.classList.toggle('hidden');
            showSandhiLogBtn.textContent = sandhiLogDiv.classList.contains('hidden') ? 'Show Advanced Log (for researchers)' : 'Hide Advanced Log';
        });

        app.querySelectorAll('input[name="nasalMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                isSanskritMode = e.target.value === 'sanskrit';
                performConversion();
                showMessage(`Nasalization set to ${isSanskritMode ? 'Homorganic Nasals (Sanskrit Mode)' : 'Anusvāra Only (General Mode)'}.`);
            });
        });

        app.querySelectorAll('input[name="outputScript"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                currentOutputScript = e.target.value;
                const scriptName = currentOutputScript.charAt(0).toUpperCase() + currentOutputScript.slice(1);
                toScriptButton.innerHTML = `→ ${scriptName}`; 
                setTransliterationMode(currentMode, true);
                performConversion();
                showMessage(`Output script set to ${scriptName}.`);
            });
        });

        uploadButton.addEventListener('click', () => {
            uploadInput.click();
        });

        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.type !== "text/plain") {
                showMessage("Error: Please upload a .txt file.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                inputTextarea.value = event.target.result;
                performConversion();
                showMessage("File loaded successfully.");
            };
            reader.onerror = () => { showMessage("Error reading file."); };
            reader.readAsText(file);
            e.target.value = null; 
        });

        downloadButton.addEventListener('click', () => {
            const textToSave = outputTextarea.textContent;
            if (!textToSave || textToSave === outputTextarea.getAttribute('data-initial-text')) {
                showMessage("Nothing to download.");
                return;
            }
            try {
                const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'lipisetu_output.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(a.href);
                showMessage("Download started...");
            } catch (err) {
                showMessage("Error starting download.");
            }
        });
        
        // Shared Copy Logic
        function copyOutputToClipboard() {
            const output = outputTextarea.textContent;
            if (output && output !== outputTextarea.getAttribute('data-initial-text')) {
                const tempInput = document.createElement('textarea');
                tempInput.value = output;
                document.body.appendChild(tempInput);
                tempInput.select();
                try {
                    document.execCommand('copy');
                    showMessage("Output copied to clipboard!");
                } catch (err) {
                    showMessage("Error copying: Please manually select and copy from the box.");
                } finally {
                    document.body.removeChild(tempInput);
                }
            } else {
                showMessage("Nothing to copy!");
            }
        }
        
        copyButton.addEventListener('click', copyOutputToClipboard);
        floatingCopyButton.addEventListener('click', copyOutputToClipboard);
        
        clearAllButton.addEventListener('click', clearAll);
        
        // --- 10️⃣ Run Full Test Suite (Now with new state machine) ---
        console.log("--- Running Lipisetu Test Suite (v1.5.1 - Upgraded Sandhi) ---");
        
        console.log("Test 1 (Simple Roman): 'Narayana' -> 'devanagari'");
        console.log("Expected: नारायण");
        console.log("Actual:", autoDetectAndConvert("Narayana"));
        
        console.log("Test 2 (IAST): 'rāmaśca' -> 'devanagari'");
        console.log("Expected: रामश्च");
        console.log("Actual:", convertIASTToScript("rāmaśca", "devanagari"));

        console.log("Test 3 (IAST): 'saṃskṛta' -> 'telugu'");
        console.log("Expected: సంస్కృత");
        console.log("Actual:", convertIASTToScript("saṃskṛta", "telugu"));
        
        console.log("Test 4 (Nukta): 'ज़' -> 'iast'");
        console.log("Expected: za"); // 'a' is added by state machine
        console.log("Actual:", convertDevanagariToIAST("ज़"));

        console.log("Test 5 (Nukta): 'q' -> 'devanagari'");
        console.log("Expected: क़्"); // 'q' is a consonant, so virama is added
        console.log("Actual:", convertIASTToScript("q", "devanagari"));
        
        console.log("Test 6 (Telugu->IAST): 'నారాయణ' -> 'iast'");
        console.log("Expected: nārāyaṇa");
        console.log("Actual:", convertTeluguToIAST("నారాయణ"));

        console.log("--- User Test Suite (Goal 10) ---");
        
        let testIn = "नारायणः जगतः नाथः अस्ति।";
        let testOut = "nārāyaṇaḥ jagataḥ nāthaḥ asti.";
        console.log(`Test: ${testIn}`);
        console.log(`Expected: ${testOut}`);
        console.log(`Actual: ${convertDevanagariToIAST(testIn)}`);

        testIn = "धर्मः शान्तिं नयति।";
        testOut = "dharmaḥ śāntiṃ nayati.";
        console.log(`Test: ${testIn}`);
        console.log(`Expected: ${testOut}`);
        console.log(`Actual: ${convertDevanagariToIAST(testIn)}`);

        testIn = "विष्णुः सर्वं व्याप्नोति।";
        testOut = "viṣṇuḥ sarvaṃ vyāpnoti.";
        console.log(`Test: ${testIn}`);
        console.log(`Expected: ${testOut}`);
        console.log(`Actual: ${convertDevanagariToIAST(testIn)}`);

        testIn = "रामः सीतया सह वनं गतः।";
        testOut = "rāmaḥ sītayā saha vanaṃ gataḥ.";
        console.log(`Test: ${testIn}`);
        console.log(`Expected: ${testOut}`);
        console.log(`Actual: ${convertDevanagariToIAST(testIn)}`);

        testIn = "गुरुः शिष्यं शिक्षयति।";
        testOut = "guruḥ śiṣyaṃ śikṣayati.";
        console.log(`Test: ${testIn}`);
        console.log(`Expected: ${testOut}`);
        console.log(`Actual: ${convertDevanagariToIAST(testIn)}`);
        
        testIn = "ब्रह्मा सृष्टिं करोति।";
        testOut = "brahmā sṛṣṭiṃ karoti.";
        console.log(`Test: ${testIn}`);
        console.log(`Expected: ${testOut}`);
        console.log(`Actual: ${convertDevanagariToIAST(testIn)}`);
        
        console.log("--- Sandhi Test Suite ---");
        console.log("Test: 'manorathaḥ'");
        console.log("Actual:", performSandhiSegmentation("manorathaḥ"));
        
        console.log("Test: 'nayanam'");
        console.log("Actual:", performSandhiSegmentation("nayanam"));
        
        console.log("Test: 'ekaikam'");
        console.log("Actual:", performSandhiSegmentation("ekaikam"));

        console.log("--- Test Suite Complete ---");
        
    }); // <-- END OF DOMCONTENTLOADED

})(); // --- END OF SCRIPT WRAPPER ---
