const  express  = require('express');
const connectToDatabase =require('./api/db/connection.js');
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const user =require('./api/routes/admin/admin.routes.js')
const product = require('./api/routes/product/product.routes.js')
const setting = require('./api/routes/settings/setting.routes.js')
const checkouts = require("./api/routes/checkougt/checkout.routes.js")
const orders = require('./api/routes/order/order.routes.js')
const vendorsagents = require("././api/routes/vendor/vendor.routes.js")
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();


const app = express()

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const allowedOrigins = [
  process.env.REACT_LOCAL_CLIENT_URL,
  process.env.REACT_LOCAL_CLIENT_DASHBOARD_URL,
  process.env.REACT_LOCAL_CLIENT_ADMIN_URL,
  'https://creamyaffairs.1kliq.com/'

];

console.log("Allowed Origins:", allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    console.log("Request Origin:", origin);
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow any origin
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// For preflight requests (OPTIONS method)
app.options('*', cors(corsOptions));

// For handling non-preflight requests
app.use((req, res, next) => {
  console.log("req.headers",req.headers)
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    console.log("Origin Allowed (Middleware):", origin);
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  return next();
});
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.use(bodyParser.json({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))


connectToDatabase()

app.use("/api/v1",user)
app.use("/api/v1/product",product)
app.use("/api/v1/settings",setting)
app.use("/api/v1/checkout",checkouts)
app.use("/api/v1/orders",orders)
app.use("/api/v1/inventory",vendorsagents)

app.get('/',function(req,res){
  res.set('Content-type', 'text/html;charset=utf-8');
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>My Awesome Server</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f0f0f0;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
          }
          .container {
              text-align: center;
              background-color: #fff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
              color: #333;
              margin-bottom: 20px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>Welcome to Creamyaffair Server</h1>
          <p>This server is up and running!</p>
      </div>
  </body>
  </html>
`);
})

module.exports = app
