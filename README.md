## Welcome to the Natours App!

The natours app provide a fully functional Frontend and Backend! The backend was developed using Node.js, Express, MongoDB and Mongoose with a course I am taking on UDEMY.

## How to start? (I will look froward in the furute to add a docker image to make this process simpler)

As this program as of 03/24/2023 runs on a local host you need to provide the following:

npm i

### Add a confige.env file that contains:

NODE_ENV=development

PORT=3000

-- You can get this from your MongoDB configuration

USERNAME= MongoDB username

DATABASE_PASSWORD= MongoDB password

DATABASE=mongodb+srv://{USERNAME}:{PASSWORD}@cluster0.qnvrsw0.mongodb.net/natours?retryWrites=true&w=majority

JWT_SECRET= needs to be 32 characters long

JWT_EXPIRES_IN=90d

-- You can get this from your mailTrap SMTP settings

EMAIL_USERNAME=yourUserName

EMAIL_PASSWORD=yourPassword

EMAIL_HOST=yourSanboxEmail

EMAIL_PORT = yourPort(should be 25)

### Add the data to your database:

# run this in order to get all the data that is stores in the json files into your database.

node ./dev-data/data/import-dev-data.js --import

### Natours API is published on postman

https://documenter.getpostman.com/view/25389695/2s93XsXRfm

# Thank you!
