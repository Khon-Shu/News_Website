const user = require("../project_model/user_model.js");
const bcrypt = require("bcryptjs");

//ADD USER
const addUser = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const userData = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      image: req.body.image,
    };

    const user_list = await user.create(userData);
    res
      .status(200)
      .json({ successful: true, message: "Succesfully Added User" });
  } catch (error) {
    res.status(404).json({ successful: false, message: error.message });
  }
};

//DELETE USER
const deleteUser = async (req, res) => {
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
};

//UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // If password is being updated, hash it first
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    const update = await user.findByIdAndUpdate(id, updateData, { new: true });
    if (!update) {
      return res
        .status(404)
        .json({ succesfull: false, message: "Unable to Update " });
    }
    return res.status(200).json(update);
  } catch (error) {
    res.status(404).json({ succesfull: false, message: error.message });
  }
};

//GET USER BY ID
const getUserById = async (req, res) => {
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
    res.status(404).json({ succesfull: false, message: error.message });
  }
};

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
};

//FUNCTION TO LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const found_email = await user.findOne({ email: email });
    if (!found_email) {
      return res
        .status(400)
        .json({ succesfull: false, message: "Email Not Found" });
    }
    const isPasswordMatch = await bcrypt.compare(password,found_email.password)
    if(!isPasswordMatch){
       return res
        .status(400)
        .json({ succesfull: false, message: "Password Don't Match" });
    }
    const userData ={
      id: found_email._id,
      username: found_email.username,
      email: found_email.email,
      image: found_email.image
    }
      return res.status(200).json({ 
      successful: true, 
      message: "Login successful",
      user: userData
    });
  } catch (error) {
    res.status(400).json({ succesfull: false, message: "Unable to Find User" });
  }
};

module.exports = { getUserById, addUser, deleteUser, updateUser, getAllUser, loginUser };
