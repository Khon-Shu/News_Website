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
message_router.get("/", fetchMessage);

//POST MESSAGE
message_router.post("/", addMessage);

//GET MESSAGE BY ID
message_router.get("/:id", fetchMessageById);

//UPDATE MESSAGE
message_router.put("/:id", updateMessage);

//DELETE MESSAGE
message_router.delete("/:id", deleteMessage);

module.exports = message_router;
