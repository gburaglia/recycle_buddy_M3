/*
 * Project combining a Teachable Machine model with gesture
 * recognition capabilities in ml5.js, specifically adjusted
 * to recognize number of fingers held up.
 */

// Enumerable for item types
const itemType = Object.freeze({
  aluminum: "Aluminum",
  paper: "Paper",
  plastic: "Plastic",
  glass: "Glass",
  non_recyclable: "Non-Recyclable",
});

// Array of only recyclable item types
recyclableTypes = [
  itemType.aluminum,
  itemType.paper,
  itemType.plastic,
  itemType.glass,
];

// Classifier Variable
let classifier;
// Storing result
let tempResult = "temp";
// Model URL
let imageModelURL = "https://teachablemachine.withgoogle.com/models/LHt4SmSUJ/";

// To store the classification
let label = "Waiting for recycle buddy model...";
let instructionLabel = "Show your object to the camera and follow the on-screen recycle guidance! If plastic indicate the plastic type by raising your fingers."

let handPose;
let video;
let hands = [];
let hand;
let totalFingers = 0;

function preload() {
  // Load the handPose model
  handPose = ml5.handPose({ flipped: true });
  classifier = ml5.imageClassifier(imageModelURL + "model.json");
}

function setup() {
  let c = createCanvas(640, 480);
  c.parent('canvas-div');
  // Create the webcam video and hide it
  video = createCapture(VIDEO, { flipped: true });
  video.size(width, height);
  video.hide();
  // start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);

  // Start classifying
  classifyVideo();
  navigator.mediaDevices.getUserMedia({ audio: true });
  textLabel = createP(instructionLabel);
  textLabel.parent('modelLabel');
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  // Draw video
  image(video, 0, 0);

  // Draw label
  labelText();

  // Draw video outline
  videoOutline();

  // Draw white points on rasied fingers tips
  drawFingerPoints();
  textLabel.html(instructionLabel);
}

// Callback function for when handPose outputs data
function gotHands(results) {
  // save the output to the hands variable
  hands = results;
}

function drawFingerPoints() {
  totalFingers = 0;
  if (hands.length > 0 && label.includes("plastic")) {
    for (let i = 0; i < hands.length; i++) {
      hand = new Hand(hands[i].keypoints); // new Hand object
      hand.searchExtremePoints();
      hand.makeBoundary();
      totalFingers += hand.countFingers();
    }
  }
}

// Prepare label text and apperance
function labelText() {
  fill(255);
  textSize(16);
  textAlign(CENTER);
  text(label, width / 2, height - 20);
}

// Place outline on video depending on item type
function videoOutline() {
  switch (tempResult) {
    case itemType.aluminum:
      stroke("orange");
      break;
    case itemType.paper:
      stroke("blue");
      break;
    case itemType.plastic:
      if (totalFingers == 1 || totalFingers == 2 || totalFingers == 5) {
        stroke("yellow");
        break;
      } else if (totalFingers == 0 ) {
        stroke("black");
        break;
      }
      else{
        stroke("brown");
      break;
      }
    case itemType.glass:
      stroke("green");
      break;
    case itemType.non_recyclable:
      stroke("brown");
      break;
    default:
      stroke("black");
  }
  strokeWeight(15);
  noFill();
  rect(2, 2, width - 4, height - 4);
  strokeWeight(2);
}

// Determine if item type is recyclable
function isRecyclable() {
  for (let i = 0; i < recyclableTypes.length; i++) {
    if (tempResult == recyclableTypes[i]) {
      if (tempResult.includes("Plastic") && totalFingers > 0) {
        switch (totalFingers) {
          case 1:
            return true;
          case 2:
            return true;
          case 5:
            return true;
          default:
            return false;
        }
      }
        return true;
      }
    
    }
  return false;
  
}

// Get a prediction for the current video frame
function classifyVideo() {
  classifier.classifyStart(video, gotResult);
}

// When we get a result, display in label
function gotResult(results) {
  tempResult = results[0].label;
  label = "";
  if (isRecyclable()) {
    label = "Recycle this it is..." + tempResult.toLowerCase();
    if (label.includes("plastic") && totalFingers > 0) {
      label = label + " of type: " + totalFingers;
    } else if (label.includes("plastic") && totalFingers == 0) {
      label = "This is..." + tempResult.toLowerCase() + " but what type?";
    }
  } else {
    label = "Throw away this is..." + tempResult.toLowerCase();
    if (label.includes("plastic") && totalFingers > 0) {
      label = label + " of type: " + totalFingers;
    }
    else if (label.includes("plastic") && totalFingers == 0) {
      label = "This is..." + tempResult.toLowerCase() + " but what type?";
    
    }
  }
}
