const mongoose = require('mongoose');
const dotEnv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../models/tourModel');

dotEnv.config({ path: './config.env' });

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

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);
//Import data to DB

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('data loaded');
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

// Delete all data from collection

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data deleted');
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
