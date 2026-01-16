const user = require("../project_model/user_model.js");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

//ADD USER with image upload
const addUser = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const userData = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    };

    const user_list = await user.create(userData);
    res
      .status(200)
      .json({ successful: true, message: "Successfully Added User", user: user_list });
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
    let updateData = {};

    // Handle form data (for file uploads)
    if (req.body) {
      updateData = { ...req.body };
    }

    // Handle file upload
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // If password is being updated, hash it first
    if (req.body && req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    const update = await user.findByIdAndUpdate(id, updateData, { new: true });
    if (!update) {
      return res
        .status(404)
        .json({ successful: false, message: "Unable to update user" });
    }
    return res
      .status(200)
      .json({ successful: true, message: "User updated successfully", data: update });
  } catch (error) {
    res.status(400).json({ successful: false, message: error.message });
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
        .status(200)
        .json({ successful: true, message: "No users found", data: [] });
    }
    return res.status(200).json({ successful: true, message: "Users found", data: users_list });
  } catch (error) {
    res.status(400).json({ successful: false, message: error.message });
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
        .json({ successful: false, message: "Email Not Found" });
    }
    const isPasswordMatch = await bcrypt.compare(password,found_email.password)
    if(!isPasswordMatch){
       return res
        .status(400)
        .json({ successful: false, message: "Password Don't Match" });
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
    res.status(400).json({ successful: false, message: "Unable to Find User" });
  }
};

module.exports = { getUserById, addUser, deleteUser, updateUser, getAllUser, loginUser, upload };
