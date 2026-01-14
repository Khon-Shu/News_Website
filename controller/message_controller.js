const message_model = require('../project_model/message_model.js')

//ADD NEW MESSAGE
const addMessage =async (req, res) => {
  try {
    const messages = await message_model.create(req.body);
    if (!messages) {
      return res
        .status(400)
        .json({ succesfull: false, message: "Failed To Deliver Message" });
    }
    return res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({ succesfull: false, message: error.message });
  }
}
//UPDATE THE MESSAGE
const updateMessage =async (req, res) => {
  try {
    const { id } = req.params;
    const update_message = await message_model.findByIdAndUpdate(id, req.body, { new: true });
    if (!update_message) {
      return res
        .status(400)
        .json({ succesfull: false, message: "Failed To Update Message" });
    }
    return res.status(200).json(update_message);
  } catch (error) {
    res.status(400).json({ succesfull: false, message: error.message });
  }
}

// DELETE MESSAGE
const deleteMessage =async (req, res) => {
  try {
    const { id } = req.params;
    const delete_message = await message_model.findByIdAndDelete(id);
    if (!delete_message) {
      return res
        .status(400)
        .json({ succesfull: false, message: "Failed To Delete Message" });
    }
    return res
      .status(200)
      .json({ succesfull: true, message: "Succesfully Deleted Message" });
  } catch (error) {
    res.status(400).json({ succesfull: false, message: error.message });
  }
}

//FETCH MESSAGE BY ID
const fetchMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const fetched_message = await message_model.findById(id)
    if(!fetched_message){
       return res
        .status(400)
        .json({ succesfull: false, message: "Failed To Get  Message" });
    }
    return res.status(200).json(fetched_message)
  } catch (error) {
    res.status(400).json({ succesfull: false, message: error.message });
  }
}

//FETCH MESSAGE
const fetchMessage =async (req, res) => {
  try {
    const fetched_messages = await message_model.find({}).populate('user');
    return res.status(200).json(fetched_messages);
  } catch (error) {
    res.status(400).json({ succesfull: false, message: error.message });
  }
}

module.exports = {updateMessage, fetchMessage, fetchMessageById, deleteMessage,addMessage}
