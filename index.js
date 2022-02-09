const { connectDB } = require("./config/connectDB");
const { hours } = require("./config/general");
const { amazonInit } = require("./helpers/amazonInit");

connectDB();

// setInterval(async () => {
amazonInit();
// }, hours * 3600000);