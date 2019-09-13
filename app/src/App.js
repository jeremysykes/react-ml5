import React, { Component } from 'react';
import './App.css';
import hippo from './hippo.jpg';
import * as ml5 from 'ml5';

class App extends Component {
  state = {
    predictions: []  // Set the empty array predictions state
  }
  classifyImg = () => {
    // Initialize the Image Classifier method with MobileNet
    const classifier = ml5.imageClassifier('MobileNet', modelLoaded);
    // When the model is loaded
    function modelLoaded() {
      console.log('Model Loaded!');
    }
    // Put the image to classify inside a variable
    const image = document.getElementById('image');
    // Make a prediction with a selected image
    classifier.predict(image, 5, function(err, results) {
      // print the result in the console
      console.log(results);
    })
    .then(results => {
      // Set the predictions in the state
      this.setPredictions(results);
    })
  }
  setPredictions = pred => {
    this.setState({
      predictions: pred
    });
  }
  componentDidMount(){
    this.classifyImg();
  }
  render() {
    // First set the predictions to a default value while loading
    let predictions = (<div className="loader"></div>);
    // Map over the predictions and return each prediction with probability
    if(this.state.predictions.length > 0){
      predictions = this.state.predictions.map((pred, i) => {
        console.log('pred, i: ', pred, i);
        let { label, confidence } = pred;
        console.log('label, confidence: ', label, confidence);
        // round the confidence with 2 decimal
        confidence = Math.floor(confidence * 10000) / 100 + "%";
        console.log('confidence: ', confidence);
        return (
          <div key={ i + "" }>{ i+1 }. Prediction: { label } at { confidence } </div>
        )
      })
    }

    return (
      <div className="App">
      <h1>Image classification with ML5.js</h1>
      <img src={ hippo } id="image" width="400" alt="" />
      { predictions }
      </div>
    );
  }
}

export default App;
