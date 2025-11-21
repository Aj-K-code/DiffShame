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
        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Compare these two images of the same room sector taken one month apart. 
    1. List items that are in the exact same position (candidates for stagnation/clutter).
    2. Identify new items that appear to be trash.
    
    Return valid JSON with this structure:
    {
      "stagnantItems": ["item 1", "item 2"],
      "trashItems": ["item 1", "item 2"]
    }
    Do not include markdown formatting or code blocks in the response. Just the raw JSON string.`;

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
