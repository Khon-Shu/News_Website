const user = require('../project_model/user_model.js')

//ADD USER
const addUser = async (req, res) => {
  try {
    const user_list = await user.create(req.body);
    res
      .status(200)
      .json({ successful: true, message: "Succesfully Added User" });
  } catch (error) {
    res.status(404).json({ successful: false, message: error.message });
  }
}

//DELETE USER
const deleteUser =  async (req, res) => {
  try {
    const { id } = req.params;
    const deleted_user = await user.findByIdAndDelete(id);

    if (!deleted_user) {
      return res
        .status(404)
        .json({ succesfull: false, message: "Unable to Delete User " });
    }
    return res
      .status(200)
      .json({ succesfull: true, message: "Succesfully Deleted User" });
  } catch (error) {
    res.status(404).json({ succesfull: false, message: error.message });
  }
}

//UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await user.findByIdAndUpdate(id, req.body);
    if (!update) {
      return res
        .status(404)
        .json({ succesfull: false, message: "Unable to Update " });
    }
    const updated_user= await user.findById(id)
    return res.status(200).json(updated_user);
  } catch (error) {
    res.status(404).json({ succesfull: false, message: error.message });
  }
}

//GET USER BY ID
const getUserById =  async (req, res) => {
  try {
    const { id } = req.params;
    const fetch_user = await user.findById(id);
    if (!fetch_user) {
      return res
        .status(404)
        .json({ succesfull: false, message: "Unable to Find User By That id" });
    }
    return res.status(200).json(fetch_user);
  } catch (error) {
    res
      .status(404)
      .json({ succesfull: false, message:  error.message });
  }
}

//GET ALL USER 
const getAllUser = async (req, res) => {
  try {
    const users_list = await user.find({});
    if (!users_list || users_list.length === 0) {
      return res
        .status(404)
        .json({ successful: false, message: "Unable To Find User" });
    }
    return res.status(200).json(users_list);
  } catch (error) {
    res.status(404).json({ successful: false, message: error.message });
  }
}

module.exports = {getUserById, addUser, deleteUser, updateUser, getAllUser}