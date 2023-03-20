const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");

const { User } = require("../../models");
const {
  validateUserCreatePayload,
  validateUserUpdatePayload,
} = require("../../validator/user");

const Op = Sequelize.Op;

//To Show All Users
async function handlerGetAllUsers(req, res) {
  const users = await User.findAll({
    attributes: ["id", "fullName", "shortName", "photo"], //Show Users with specific column
  });
  return res.status(200).json({
    status: "success",
    message: "Successfully get all users",
    data: users,
  });
}
//To Show user by id
async function handlerGetUserById(req, res) {
  const { id } = req.params;
  //search one user by id
  const user = await User.findOne({
    where: {
      id: `${id}`,
    },
  });

  if (user) {
    //user is found
    return res.status(200).json({
      status: "success",
      message: "Successfully get user by id",
      data: user,
    });
  } else {
    return res.status(404).json({
      status: "failed",
      message: "User id not found",
    });
  }
}
//Search user by name
async function handlerSearchUser(req, res) {
  const { name } = req.query;
  if (name) {
    //if name is not null
    const users = await User.findAll({
      attributes: ["id", "fullName", "shortName", "photo"],
      where: {
        fullName: {
          [Op.like]: `%${name}%`,
        },
      },
    });
    return res.status(200).json({
      status: "success",
      message: "Successfully get user by name",
      data: users,
    });
  } //if query name is null or not found
  return res.status(404).json({
    status: "failed",
    message: "Attributes not found",
  });
}
//Input User
async function handlerPostUser(req, res) {
  try {
    const { email, password, fullName, shortName, biodata, angkatan, jabatan } =
      req.body;
    validateUserCreatePayload(req.body);
    //hash password with bcrypt
    const hashPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashPassword,
      fullName,
      shortName,
      biodata,
      angkatan,
      jabatan,
    });
    return res.status(200).json({
      status: "success",
      message: "Successfully create user",
      data: await User.findOne({
        attributes: { exclude: ["password", "createdAt", "updatedAt"] },
        order: [["createdAt", "DESC"]], //to sent last data inserted to database
      }),
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Fail to insert.",
    });
  }
}
//Update User
async function handlerUpdateUser(req, res) {
  try {
    const { id } = req.params;
    const { fullName, shortName, biodata, angkatan, jabatan } = req.body; //get value from user
    validateUserUpdatePayload(req.body);

    const user = await User.findByPk(id); //search user by id
    if (!user) {
      //if user not found
      res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    } else {
      await user.update({
        //update to database
        fullName,
        shortName,
        biodata,
        angkatan,
        jabatan,
      });
      return res.status(200).json({
        status: "success",
        message: "Successfully update user",
      });
    }
  } catch (error) {
    next(error);
  }
}
//Delete user
async function handlerDeleteUser(req, res) {
  const { id } = req.params;
  const user = await User.findByPk(id); //to search user by primary key id
  if (!user) {
    //if user not found
    return res.status(404).json({
      status: "failed",
      message: "User not found",
    });
  } else {
    try {
      await user.destroy(); //delete user
      return res.status(200).json({
        status: "success",
        message: "Successfully delete user",
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Failed to delete user",
      });
    }
  }
}




module.exports = {
  handlerGetAllUsers,
  handlerGetUserById,
  handlerSearchUser,
  handlerPostUser,
  handlerUpdateUser,
  handlerDeleteUser,
};
