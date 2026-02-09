/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module 'ml5' {
  interface ImageClassifier {
    predict(img: HTMLImageElement, topK?: number): Promise<Array<{ label: string; confidence: number }>>
  }
  export function imageClassifier(model: string): Promise<ImageClassifier>
}
