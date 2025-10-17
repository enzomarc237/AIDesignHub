
import { GoogleGenAI, Type } from "@google/genai";
import type { DesignSpecification } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        layoutStructure: {
            type: Type.OBJECT,
            properties: {
                description: { 
                    type: Type.STRING,
                    description: "A concise description of the overall layout, e.g., 'Single-column with header', 'Grid-based dashboard'."
                }
            },
            required: ["description"]
        },
        uiComponents: {
            type: Type.ARRAY,
            description: "A list of identified UI components in the image.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { 
                        type: Type.STRING,
                        description: "The type of the component (e.g., 'button', 'text_input', 'card', 'navbar')."
                    },
                    label: { 
                        type: Type.STRING,
                        description: "The text label of the component, if any (e.g., 'Sign In', 'Search...')."
                    },
                    properties: {
                        type: Type.OBJECT,
                        description: "Key-value pairs describing component properties like colors.",
                        properties: {
                            backgroundColor: { type: Type.STRING, description: "Background color in hex format." },
                            textColor: { type: Type.STRING, description: "Text color in hex format." },
                            borderColor: { type: Type.STRING, description: "Border color in hex format." },
                        }
                    }
                },
                 required: ["type", "label", "properties"]
            }
        },
        colorPalette: {
            type: Type.ARRAY,
            description: "The dominant colors used in the design.",
            items: {
                type: Type.OBJECT,
                properties: {
                    hex: { 
                        type: Type.STRING,
                        description: "The color in hex format (e.g., '#FFFFFF')."
                    },
                    role: { 
                        type: Type.STRING,
                        description: "The role of the color (e.g., 'primary', 'background', 'accent', 'text')."
                    }
                },
                required: ["hex", "role"]
            }
        },
        typography: {
            type: Type.ARRAY,
            description: "The different font styles used in the design.",
            items: {
                type: Type.OBJECT,
                properties: {
                    fontFamily: { 
                        type: Type.STRING,
                        description: "Best-effort guess of the font family (e.g., 'Inter', 'Roboto', or 'sans-serif')."
                    },
                    fontSize: { 
                        type: Type.STRING,
                        description: "Estimated font size (e.g., '16px', '2rem')."
                    },
                    fontWeight: { 
                        type: Type.STRING,
                        description: "Estimated font weight (e.g., '400', 'bold')."
                    },
                    colorHex: { 
                        type: Type.STRING,
                        description: "The font color in hex format."
                    },
                    context: { 
                        type: Type.STRING,
                        description: "The context where this style is used (e.g., 'heading', 'body text', 'button label')."
                    }
                },
                 required: ["fontFamily", "fontSize", "fontWeight", "colorHex", "context"]
            }
        },
        generalDesignInfo: {
            type: Type.OBJECT,
            properties: {
                perceivedStyle: { 
                    type: Type.STRING,
                    description: "The overall perceived design style (e.g., 'Minimalist', 'Material Design', 'Neumorphic')."
                },
                notes: { 
                    type: Type.STRING,
                    description: "Any other relevant design notes or observations."
                }
            },
            required: ["perceivedStyle", "notes"]
        }
    },
    required: ["layoutStructure", "uiComponents", "colorPalette", "typography", "generalDesignInfo"]
};

export const analyzeImageForDesign = async (base64ImageData: string, mimeType: string): Promise<DesignSpecification> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: `Analyze this UI screenshot and provide a detailed breakdown of its design specifications. Identify the layout, all key UI components, the color palette, typography, and the overall design style. Structure your response according to the provided JSON schema.`,
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);
        
        if (!parsedJson.colorPalette || !parsedJson.uiComponents) {
            throw new Error("AI response did not match the expected format.");
        }

        return parsedJson as DesignSpecification;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get design specifications from AI.");
    }
};

export const generateWithContext = async (prompt: string, images: { base64ImageData: string, mimeType: string }[]): Promise<string> => {
    try {
        const imageParts = images.map(image => ({
            inlineData: {
                data: image.base64ImageData,
                mimeType: image.mimeType,
            },
        }));

        const textPart = {
            text: prompt,
        };

        const parts = [textPart, ...imageParts];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: parts },
        });

        return response.text;

    } catch (error) {
        console.error("Error calling Gemini API with context:", error);
        throw new Error("Failed to generate response from AI with context.");
    }
};