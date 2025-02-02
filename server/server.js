const cluster = require('cluster');
const os = require('os');
const app = require('./app');
const connectToDatabase = require('./api/db/connection'); // Import DB connection

const PORT = process.env.PORT || 8000;

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`Master process running. Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  (async () => {
    try {
      // Connect to MongoDB FIRST
      await connectToDatabase();
      console.log(`Worker ${process.pid} connected to MongoDB`);

      // Start the server AFTER connection
      const server = app.listen(PORT, () => {
        console.log(`Worker ${process.pid} listening on port ${PORT}`);
      });

      // Graceful shutdown
      process.on('SIGINT', () => {
        server.close(() => {
          console.log(`Worker ${process.pid} shutting down...`);
          process.exit(0);
        });
      });
    } catch (error) {
      console.error(`Worker ${process.pid} failed to connect to MongoDB:`, error);
      process.exit(1); // Exit with failure
    }
  })();
}