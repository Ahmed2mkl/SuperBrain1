// OpenAI client utilities and helper functions for the frontend
// This file provides utilities for formatting and handling OpenAI-related data

export interface AIModel {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

export const AI_MODELS: AIModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o Vision (Unrestricted)",
    description: "Latest multimodal model with vision capabilities and unrestricted responses",
    capabilities: ["text", "vision", "analysis", "creative", "code", "sensitive-topics"]
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "Fast and efficient text generation with extended context",
    capabilities: ["text", "analysis", "creative", "code"]
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "Quick responses for general conversations",
    capabilities: ["text", "basic-analysis"]
  },
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    description: "Advanced image generation from text descriptions",
    capabilities: ["image-generation"]
  }
];

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  category: "analysis" | "creative" | "technical" | "general";
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "analyze-image",
    label: "Analyze Image",
    icon: "image",
    prompt: "Analyze this image and tell me everything you can see, including details about composition, colors, objects, people, emotions, and any text or symbols present:",
    category: "analysis"
  },
  {
    id: "debug-code",
    label: "Debug Code",
    icon: "code",
    prompt: "Help me debug this code. Please review it for errors, suggest improvements, and explain any issues you find:",
    category: "technical"
  },
  {
    id: "creative-writing",
    label: "Creative Writing",
    icon: "pen-tool",
    prompt: "Help me write a creative story. I'd like you to be imaginative and detailed in your writing. The topic is:",
    category: "creative"
  },
  {
    id: "deep-analysis",
    label: "Deep Analysis",
    icon: "brain",
    prompt: "Provide a comprehensive, deep analysis of the following topic. Consider multiple perspectives, implications, and nuances:",
    category: "analysis"
  },
  {
    id: "explain-concept",
    label: "Explain Concept",
    icon: "book",
    prompt: "Explain this concept in detail, breaking it down into understandable parts with examples:",
    category: "general"
  },
  {
    id: "solve-problem",
    label: "Solve Problem",
    icon: "lightbulb",
    prompt: "Help me solve this problem step by step. Please think through it methodically:",
    category: "general"
  }
];

// Utility functions for handling file types and validation
export const SUPPORTED_FILE_TYPES = {
  images: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp"],
  videos: ["video/mp4", "video/avi", "video/mov", "video/wmv"],
  audio: ["audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"],
  documents: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
};

export function isFileTypeSupported(file: File): boolean {
  const allSupportedTypes = [
    ...SUPPORTED_FILE_TYPES.images,
    ...SUPPORTED_FILE_TYPES.videos,
    ...SUPPORTED_FILE_TYPES.audio,
    ...SUPPORTED_FILE_TYPES.documents
  ];
  
  return allSupportedTypes.includes(file.type);
}

export function getFileTypeCategory(file: File): string {
  if (SUPPORTED_FILE_TYPES.images.includes(file.type)) return "image";
  if (SUPPORTED_FILE_TYPES.videos.includes(file.type)) return "video";
  if (SUPPORTED_FILE_TYPES.audio.includes(file.type)) return "audio";
  if (SUPPORTED_FILE_TYPES.documents.includes(file.type)) return "document";
  return "unknown";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Token estimation utilities
export function estimateTokenCount(text: string): number {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

export function formatTokenCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return (count / 1000).toFixed(1) + "K";
  return (count / 1000000).toFixed(1) + "M";
}

// Message formatting utilities
export function formatMessageTime(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return messageDate.toLocaleDateString();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

// Conversation utilities
export function generateConversationTitle(content: string): string {
  // Remove image prefixes and clean up content
  const cleanContent = content
    .replace(/^(analyze this image|look at this image|what do you see)/i, "")
    .trim();
  
  if (!cleanContent) return "New Conversation";
  
  // Truncate and clean
  const title = cleanContent.substring(0, 50).trim();
  return title + (cleanContent.length > 50 ? "..." : "");
}

// Error handling utilities
export interface AIError {
  type: "network" | "api" | "file" | "validation" | "unknown";
  message: string;
  details?: string;
}

export function handleAIError(error: any): AIError {
  if (error.message?.includes("fetch")) {
    return {
      type: "network",
      message: "Network connection failed",
      details: "Please check your internet connection and try again."
    };
  }
  
  if (error.message?.includes("API key")) {
    return {
      type: "api",
      message: "API authentication failed",
      details: "Please check your OpenAI API key configuration."
    };
  }
  
  if (error.message?.includes("file")) {
    return {
      type: "file",
      message: "File processing failed",
      details: "The uploaded file could not be processed. Please try a different file."
    };
  }
  
  return {
    type: "unknown",
    message: "An unexpected error occurred",
    details: error.message || "Please try again or contact support if the problem persists."
  };
}

// Status and capability utilities
export interface SystemStatus {
  model: string;
  mode: "restricted" | "unrestricted";
  capabilities: string[];
  tokensUsed: number;
  tokensLimit: number;
}

export function getSystemStatus(): SystemStatus {
  return {
    model: "GPT-4o Vision",
    mode: "unrestricted",
    capabilities: [
      "Text Generation",
      "Image Analysis", 
      "Creative Writing",
      "Code Assistance",
      "Sensitive Topics",
      "Multi-modal Processing"
    ],
    tokensUsed: 0, // This would be tracked in actual usage
    tokensLimit: 32000
  };
}

export function formatCapabilities(capabilities: string[]): string {
  if (capabilities.length <= 2) {
    return capabilities.join(" • ");
  }
  
  return capabilities.slice(0, 2).join(" • ") + ` • +${capabilities.length - 2} more`;
}
