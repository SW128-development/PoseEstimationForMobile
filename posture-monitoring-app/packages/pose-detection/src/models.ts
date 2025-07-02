import { ModelInfo } from './types';

export const AVAILABLE_MODELS: Record<string, ModelInfo> = {
  cpm: {
    name: 'CPM (Convolutional Pose Machine)',
    inputSize: { width: 192, height: 192 },
    outputStride: 8,
    quantized: false,
  },
  hourglass: {
    name: 'Hourglass Network',
    inputSize: { width: 192, height: 192 },
    outputStride: 4,
    quantized: false,
  },
  cpm_quantized: {
    name: 'CPM Quantized',
    inputSize: { width: 192, height: 192 },
    outputStride: 8,
    quantized: true,
  },
};

export function getModelInfo(modelType: string): ModelInfo {
  return AVAILABLE_MODELS[modelType] || AVAILABLE_MODELS.cpm;
}

export function getModelPath(modelType: string, basePath: string = '/models'): string {
  const modelInfo = getModelInfo(modelType);
  const folder = modelInfo.quantized ? `${modelType.replace('_quantized', '')}_quantized` : modelType;
  return `${basePath}/${folder}/model.json`;
}