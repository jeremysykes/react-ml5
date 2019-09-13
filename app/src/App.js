import * as THREE from 'three';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { Canvas } from 'react-three-fiber';

import './App.css';

// P5
import P5Wrapper from 'react-p5-wrapper';
import P5Sound from 'p5/lib/addons/p5.sound';
import P5Dom from 'p5/lib/addons/p5.dom';
import sketch from './sketch';

// Tensorflow
import animal from './platypus.jpg';
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
  Thing3d = ({ vertices }) => {
    return (
      <group ref={ref => console.log('we have access to the instance')}>
        <line>
          <geometry
            attach="geometry"
            vertices={vertices.map(v => new THREE.Vector3(...v))}
            onUpdate={self => (self.verticesNeedUpdate = true)}
          />
          <lineBasicMaterial attach="material" color="black" />
        </line>
        <mesh 
          onClick={e => console.log('click')} 
          onPointerOver={e => console.log('hover')} 
          onPointerOut={e => console.log('unhover')}>
          <octahedronGeometry attach="geometry" />
          <meshBasicMaterial attach="material" color="peachpuff" opacity={0.5} transparent />
        </mesh>
      </group>
    )
  }
  render() {
    // First set the predictions to a default value while loading
    let predictions = (<div className="loader"></div>);
    // Map over the predictions and return each prediction with probability
    if(this.state.predictions.length > 0){
      predictions = this.state.predictions.map((pred, i) => {
        let { label, confidence } = pred;
        // round the confidence with 2 decimal
        confidence = Math.floor(confidence * 10000) / 100 + "%";
        return (
          <div key={ i + "" }>{ i+1 }. Prediction: { label } at { confidence } </div>
        )
      })
    }

    let p5Example = <P5Wrapper sketch={sketch} />;

    return (
      <div className="App">
      <h1>Image classification with ML5.js</h1>
      <img src={ animal } id="image" width="400" alt="" />
      { predictions }
      { p5Example }
      <Canvas>
        <Thing3d vertices={[[-1, 0, 0], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0]]} />
      </Canvas>
      </div>
    );
  }
}

export default App;
