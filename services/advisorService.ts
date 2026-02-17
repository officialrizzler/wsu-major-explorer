
import { programsRaw, interestMappings } from '../data/wsuData';

const COMMON_QUERIES_CACHE = new Map<string, string>([
    ['hello', "Hi there! I'm Warrior Bot. How can I help you explore WSU majors today?"],
    ['hi', "Hi there! I'm Warrior Bot. How can I help you explore WSU majors today?"],
    ['hey', "Hey! I'm Warrior Bot. How can I help you explore WSU majors today?"],
    ['what can you do', "I can help you find information about majors at WSU, compare them, or answer general questions about college life. What are you interested in?"],
    ['thanks', "You're welcome! Is there anything else I can help you with?"],
    ['thank you', "You're welcome! Let me know if you have more questions."],
]);


export const getAdvisorResponse = async (chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[], userQuery: string): Promise<string> => {

    const normalizedQuery = userQuery.trim().toLowerCase().replace(/[^\w\s]/g, '');
    if (COMMON_QUERIES_CACHE.has(normalizedQuery)) {
        return COMMON_QUERIES_CACHE.get(normalizedQuery)!;
    }

    // Search for relevant programs based on the user's query
    const lowerQuery = userQuery.toLowerCase();
    const matchedPrograms = programsRaw.filter(p => {
        const nameMatch = p.program_name.toLowerCase().includes(lowerQuery);
        const keywordMatch = Object.values(interestMappings).some(interest =>
            interest.keywords.some(kw => lowerQuery.includes(kw))
        );
        const degreeTypeMatch = lowerQuery.includes(p.degree_type.toLowerCase());
        return nameMatch || keywordMatch || degreeTypeMatch;
    }).slice(0, 5); // Limit to 5 most relevant programs

    try {
        const response = await fetch("/api/chat", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chatHistory,
                userQuery,
                programContext: matchedPrograms.map(p => ({
                    program_name: p.program_name,
                    degree_type: p.degree_type,
                    program_credits: p.program_credits,
                    short_description: p.short_description,
                    total_credits: p.total_credits,
                }))
            }),
        });

        if (response.status === 429) {

            const errorData = await response.json().catch(() => ({ error: "You've reached the message limit for today. Please try again tomorrow." }));
            return errorData.error;
        }

        if (!response.ok) {

            const errorData = await response.json().catch(() => ({}));
            console.error("Error fetching from /api/chat:", response.status, errorData.error);
            // Throw the specific error message from the API if available
            throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        return data.text || "I'm sorry, I couldn't get a proper response. Please try again.";

    } catch (error) {
        console.error("Error in getAdvisorResponse:", error);
        return "I'm sorry, I encountered a connection error. Please check your network and try again. If the problem persists, please try again later.";
    }
};
