const express = require("express");
const message_router = express.Router();

const {
  updateMessage,
  fetchMessage,
  fetchMessageById,
  deleteMessage,
  addMessage,
} = require("../controller/message_controller.js");
//GET MESSAGES
message_router.get("/message/api", fetchMessage);

//POST MESSAGE
message_router.post("/message/api", addMessage);
//DELETE MESSAGE
message_router.delete("/message/api/:id", deleteMessage);

//UPDATE MESSAGE
message_router.put("/message/api/:id", updateMessage);
//GET MESSAGE BY ID
message_router.get("/messages/api/:id", fetchMessageById);
