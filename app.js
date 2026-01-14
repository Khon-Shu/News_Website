const express = require("express");
const app = express();
const mongoose = require("mongoose");


const user_router = require("./routes/userRoutes.js");
const admin_router = require("./routes/adminRouter.js");
const message_router = require('./routes/messageRouter.js')


//TO ENCODE JSON FILES
app.use(express.json());

//TO GET DATA (FORM FORMAT)
app.use(express.urlencoded());

//ROUTER FOR USER HANDLING
app.use("/users/api", user_router);

//ROUTER FOR ADMIN HANDLING
app.use("/admin/api", admin_router);



//ROUTER FOR MESSAGE HANDLING
app.use("/message/api", admin_router);

app.get("/", (req, res) => {
  app.send("This is homepage");
});
mongoose
  .connect(
    "mongodb+srv://amitdb:NmUicO0b3fiUAyzB@databaseapi.ltqn5l0.mongodb.net/?appName=databaseapi"
  )
  .then(() => {
    console.log("Connected to Database");
    app.listen(5000, () => {
      console.log("App is listening to server port 5000....");
    });
  })
  .catch((error) => {
    console.log("Unable to connect to database");
    console.log("Error:", error.message);
  });
