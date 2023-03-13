const dotEnv = require('dotenv');
const mongoose = require('mongoose');
dotEnv.config({ path: './config.env' });
const app = require('./app');

//handels all syncronous unhandeled rejections
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! Sutting down the process');
  console.log(err.name, err.message);
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection established'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('listening on port ' + port);
});

// handleing all asynchronous unhandled rejected promises
process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log('Unhandled rejection! Sutting down the process');
  // allows the server to have time to handle all pending requests before stoping the processes
  server.close(() => {
    // statuse exit code 1 means the process exits due to unhandled rejections
    process.exit(1);
  });
});
