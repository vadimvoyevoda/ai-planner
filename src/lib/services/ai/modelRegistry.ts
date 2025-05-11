import type { ModelCapabilityRequirements } from "./types";

interface ModelInfo {
  name: string;
  maxTokens: number;
  features: ("function_calling" | "json_mode" | "vision")[];
}

const MODEL_REGISTRY: Record<string, ModelInfo> = {
  "gpt-3.5-turbo": {
    name: "gpt-3.5-turbo",
    maxTokens: 4096,
    features: ["function_calling", "json_mode"],
  },
  "gpt-4": {
    name: "gpt-4",
    maxTokens: 8192,
    features: ["function_calling", "json_mode"],
  },
  "gpt-4-vision-preview": {
    name: "gpt-4-vision-preview",
    maxTokens: 128000,
    features: ["function_calling", "json_mode", "vision"],
  },
  "gpt-4o-mini": {
    name: "gpt-4o-mini",
    maxTokens: 8192,
    features: ["function_calling", "json_mode"],
  },
};

export function findModelByCapabilities(requirements: ModelCapabilityRequirements): string {
  const candidates = Object.values(MODEL_REGISTRY).filter((model) => {
    if (requirements.minTokens && model.maxTokens < requirements.minTokens) {
      return false;
    }

    if (requirements.features && !requirements.features.every((feature) => model.features.includes(feature))) {
      return false;
    }

    return true;
  });

  if (candidates.length === 0) {
    throw new Error("No model matches the specified requirements");
  }

  return candidates.sort((a, b) => b.maxTokens - a.maxTokens)[0].name;
}

export function getModelInfo(modelName: string): ModelInfo {
  if (!MODEL_REGISTRY[modelName]) {
    throw new Error(`Unknown model: ${modelName}`);
  }
  return MODEL_REGISTRY[modelName];
}
