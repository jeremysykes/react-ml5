import { useState, useEffect, useRef } from 'react'
import * as ml5 from 'ml5'
import './App.css'

export default function App() {
  const [predictions, setPredictions] = useState([])
  const imgRef = useRef(null)

  useEffect(() => {
    const classify = async () => {
      const image = imgRef.current
      if (!image) return

      const classifier = await ml5.imageClassifier('MobileNet')
      const results = await classifier.predict(image, 5)
      setPredictions(results)
    }

    classify().catch(console.error)
  }, [])

  const predictionList = predictions.length > 0
    ? predictions.map((pred, i) => {
        const confidence = `${Math.floor(pred.confidence * 10000) / 100}%`
        return (
          <div key={i}>
            {i + 1}. Prediction: {pred.label} at {confidence}
          </div>
        )
      })
    : <div className="loader" />

  return (
    <div className="App">
      <h1>Image classification with ML5.js</h1>
      <img ref={imgRef} src="/platypus.jpg" width={400} alt="Platypus" />
      {predictionList}
    </div>
  )
}
