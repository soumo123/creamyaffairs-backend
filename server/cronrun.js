const dotenv = require('dotenv');
const { productExpiry, sendNotification } = require('./api/crone-files/productexpire.js'); // Adjust the path accordingly
const connectToDatabase =require('./api/db/connection.js');

dotenv.config(); // Load environment variables
connectToDatabase()
// Invoke your cron functions
productExpiry();
sendNotification();

console.log("Cron jobs are running...");