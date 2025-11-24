import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AnalysisResult {
    stagnantItems: string[];
    trashItems: string[];
}

export class GeminiService {
    private genAI: GoogleGenerativeAI;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async analyzeImages(currentImageBase64: string, previousImageBase64: string): Promise<AnalysisResult> {
        // Use specific version to avoid 404s
        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

        const prompt = `You're a brutally honest cleaning coach analyzing someone's room progress. Compare these two images taken one month apart.

Be direct and a bit harsh (but still helpful):

1. List items that are in the exact same position as last month (these are "collecting dust" and probably not being used).
2. Identify new mess, clutter, or trash that appeared.

Focus on:
- Things that clearly haven't moved in a month (clothes on chairs, random items on surfaces, etc.)
- New mess that was added
- Unused items taking up space
- General disorganization

Return ONLY raw JSON (no markdown, no code blocks) with this structure:
{
  "stagnantItems": ["具体的 item that hasn't moved in a month", "another stagnant item"],
  "trashItems": ["new mess or clutter item", "another trash/clutter item"]
}

Be specific about what you see. Call out the laziness. No sugarcoating.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: previousImageBase64,
                    mimeType: "image/jpeg",
                },
            },
            {
                inlineData: {
                    data: currentImageBase64,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        try {
            // Clean up any potential markdown formatting if the model ignores the instruction
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse Gemini response:", text);
            throw new Error("Failed to parse AI analysis results");
        }
    }
}
