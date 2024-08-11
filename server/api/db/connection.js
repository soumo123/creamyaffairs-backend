const mongoose =require('mongoose')
const dotenv = require('dotenv');
dotenv.config();


const username = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD


const URL = `mongodb://${username}:${password}@ac-c9takjb-shard-00-00.qbibdoe.mongodb.net:27017,ac-c9takjb-shard-00-01.qbibdoe.mongodb.net:27017,ac-c9takjb-shard-00-02.qbibdoe.mongodb.net:27017/?ssl=true&replicaSet=atlas-vjeqwy-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`
const connectToDatabase = async () => {
    try {
      await mongoose.connect(URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`Connection is successful`);
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };
  module.exports =  connectToDatabase;  