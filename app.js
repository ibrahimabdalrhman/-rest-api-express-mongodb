const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
mongoose.set("strictQuery", true);
const path = require('path');
const multer = require('multer');
const io=require('./socket');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

//uploading images
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpg') {
    cb(null, true);
  } else {
    cb(null, false);
    
  }
};

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: 'a' }
);


app.use(bodyParser.json());
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

app.use(
  multer({ storage: fileStorage, filter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

//routes
const eventRoute = require('./routes/eventsRoute');
const authRouter=require("./routes/authRouter")
app.use('/api', eventRoute);
app.use("/auth", authRouter);

//error handling
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message || error;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});


mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.xqtttwu.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
  )
  .then((data) => {
    const server = app.listen(process.env.PORT || 8080);
    console.log(`server listening on port ${process.env.PORT}...`);
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client Connected...");
    });
  })
  .catch((err) => {
    console.log(err);
  });
