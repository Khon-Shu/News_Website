const admin = require("../project_model/admin_model.js");
const bcrypt = require("bcryptjs");

//  ADD ADMIN
const addAdmin = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user_data = {
      username: req.body.username,
      user_type: req.body.user_type,
      email: req.body.email,
      password: hashedPassword,
    };
    const add_admin = await admin.create(user_data);
    if (!add_admin) {
      return res
        .status(400)
        .json({ successfull: false, message: "Unable To Add Admin" });
    }
    return res.status(200).json(add_admin);
  } catch (error) {
    res.status(400).json({ successfull: false, message: error.message });
  }
};

//UPDATE ADMIN
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // If password is being updated, hash it first
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    const updateAdmin = await admin.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updateAdmin) {
      return res
        .status(400)
        .json({ successfull: false, message: "Unable To Update Admin" });
    }
    return res.status(200).json(updateAdmin);
  } catch (error) {
    res.status(400).json({ successfull: false, message: error.message });
  }
};

//GET ADMIN BY ID
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const adminById = await admin.findById(id);
    if (!adminById) {
      return res
        .status(400)
        .json({ successfull: false, message: "Unable To Get Admin By Id" });
    }
    return res.status(200).json({ adminById });
  } catch (error) {
    res.status(400).json({ successfull: false, message: error.message });
  }
};

//GET ADMIN
const getAdmin = async (req, res) => {
  try {
    const total_admin = await admin.find({});
    if (!total_admin) {
      return res
        .status(400)
        .json({ successfull: false, message: "Unable to find admin" });
    }
    return res.status(200).json(total_admin);
  } catch (error) {
    res.status(400).json({ successfull: false, message: error.message });
  }
};

// DELETE ADMIN
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteAdmin = await admin.findByIdAndDelete(id);
    if (!deleteAdmin) {
      return res
        .status(400)
        .json({ successfull: false, message: "Unable To Delete Admin" });
    }
    return res
      .status(200)
      .json({ successfull: true, message: "Admin Deleted Succesfully" });
  } catch (error) {
    res.status(400).json({ successfull: false, message: error.message });
  }
};

//LOGIN MODULE FOR ADMIN
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const found_admin = await admin.findOne({ email: email });
    if (!found_admin) {
      return res
        .status(400)
        .json({ successfull: false, message: "Please give valid email" });
    }

      //CHECK IF THE PASSWORD MATCHES
      const isPasswordMatch = await bcrypt.compare(
        password,
        found_admin.password
      );

      if (!isPasswordMatch) {
        return res
          .status(400)
          .json({ successfull: false, message: "Password Incorrect" });
      }

      const adminData = {
        id: found_admin._id,
        username: found_admin.username,
        email: found_admin.email,
        user_type: found_admin.user_type,
      };

      return res
        .status(200)
        .json({
          successfull: true,
          message: "Login Succesful",
          data: adminData,
        });
    
  } catch (error) {
    res.status(400).json({successfull: false, message: error.message})
  }
};
module.exports = { getAdmin, getAdminById, deleteAdmin, updateAdmin, addAdmin , loginAdmin};
