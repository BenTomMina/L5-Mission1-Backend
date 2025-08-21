//MS Azure Imports
const util = require("util");
const fs = require("fs");
const {
  PredictionAPIClient,
} = require("@azure/cognitiveservices-customvision-prediction");
const { ApiKeyCredentials } = require("@azure/ms-rest-js");

//Module Imports
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
require("dotenv").config();

//Enable Express
const app = express();

//Middleware
app.use(express.json());
app.use(cors());
app.use(fileUpload());

// Retrieve environment variables
const predictionKey = process.env["VISION_PREDICTION_KEY"];
const predictionResourceId = process.env["VISION_PREDICTION_RESOURCE_ID"];
const predictionEndpoint = process.env["VISION_PREDICTION_ENDPOINT"];
const predictionProjectID = process.env["VISION_PREDICTION_PROJECT_ID"];
const predictionModelName =
  process.env["VISION_PREDICTION_PUBLISHED_MODEL_NAME"];

//Create client
const credentials = new ApiKeyCredentials({
  inHeader: { "Prediction-key": predictionKey },
});
const predictor = new PredictionAPIClient(credentials, predictionEndpoint);

// //Backend Testing if connecting to Prediction API ---------------
// //Predict from a local image file
// async function predictImage(image) {
//   const stream = fs.readFileSync(image);

//   const results = await predictor.classifyImage(
//     predictionProjectID,
//     predictionModelName,
//     stream
//   );

//   results.predictions.forEach((pred) => {
//     console.log(`${pred.tagName}: ${pred.probability.toFixed(2)}`);
//   });

//   return results;
// }

// //Example usage
// predictImage("../../Car Images/zTests/Hatchback Test (5).jpg")
//   .then(() => console.log("Prediction complete"))
//   .catch((err) => console.error("Error:", err));
// //Backed Testing end ------------------------------------------

// Endpoint for processing uploaded image
app.post("/predict", async (req, res) => {
  if (!req.files || !req.files.image)
    return res.status(400).send({ error: "No file uploaded" });

  const imageFile = req.files.image;

  try {
    const results = await predictor.classifyImage(
      predictionProjectID,
      predictionModelName,
      imageFile.data
    );

    //return JSON predicted to frontend
    res.json(results);
  } catch (err) {
    console.error("Prediction error", err);
    res.status(500).send({ error: "Prediction failed" });
  }
});

//Start server
const PORT = process.env.PORT;
app
  .listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  .on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error("Port is already in use");
    } else {
      console.error("Server Error:", error);
    }
  });
