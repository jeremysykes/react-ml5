import { useState, useEffect, useRef } from 'react'
import * as ml5 from 'ml5'
import styles from './App.module.css'

const TOP_K = 5

interface Prediction {
  label: string
  confidence: number
}

function formatPercent(n: number): string {
  return `${Math.floor(n * 10000) / 100}%`
}

export default function App() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [error, setError] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const classify = async () => {
      const image = imgRef.current
      if (!image) return

      try {
        const classifier = await ml5.imageClassifier('MobileNet')
        const results = await classifier.predict(image, TOP_K)
        setPredictions(results)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Classification failed')
      }
    }

    classify()
  }, [])

  return (
    <main className={styles.app}>
      <h1 className={styles.title}>Image classification with ML5.js</h1>
      <img
        ref={imgRef}
        src="/assets/platypus.jpg"
        width={400}
        alt="Platypus"
        className={styles.image}
      />
      {error ? (
        <p className={styles.error}>{error}</p>
      ) : predictions.length > 0 ? (
        <ul className={styles.predictions}>
          {predictions.map((pred, i) => (
            <li key={`${pred.label}-${i}`} className={styles.item}>
              {i + 1}. {pred.label} — {formatPercent(pred.confidence)}
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.loader} aria-hidden="true" />
      )}
    </main>
  )
}
