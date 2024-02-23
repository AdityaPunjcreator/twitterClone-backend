const mongoose = require("mongoose"); // imported the mongoose module to create a schema
const validator = require("validator");
const bcrypt = require("bcryptjs");
// creating a user schema below
const user_schema = new mongoose.Schema({
  fullname: {
    type: String,
    trim: true, // to remove the extra whitespace
    required: [true, "fullname is a required field"],
    minlength: [2, "minimum character in the name should be 2"],
    maxength: [50, "maximum character in the name should be 50"],
  },
  email: {
    type: String,
    required: [true, "email is a required field "],
    validate: [validator.isEmail, "please enter a valid email address"],
    unique: true, // this field should be unique
    trim: true,
  },

  image: {
    type: String,
    default:
      "https://img.freepik.com/premium-vector/avatar-profile-icon-vector-illustration_276184-165.jpg", // setting up a default field
  },

  createdOn: {
    type: String, // taking the type as string
    default: new Date().toLocaleDateString(),
  },

  password: {
    type: String,
    required: true,
    select: false, // This field won't be included in query results by default
    minlength: [8, "password should be minimum 8 characters"],
  },

  confirmPassword: {
    type: String,
    required: true,
    validate: {
      // here we are creating our custom validator
      validator: function (value) {
        return value === this.password; // it will return us a boolean value
      },
      message: "password and confirm password does not match",
    },
  },

  followers: [
    {
      type: String,
    },
  ],
  following: [
    {
      type: String,
    },
  ],
});

/* now before saving the password in the database,i would also want to encrypt it so for that i will be using 
the mongoose "pre hook" document middleware and will encrypt it using bcrypt js library  */

user_schema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined; // i don't want to set the confirm password value in the database
});

// now basically we will be checking the password entered by the user and the password present in the database
// and to achieve that we are going to use "instance" method
user_schema.methods.passwordComparision = async function (pwdbyuser, pwdindb) {
  return await bcrypt.compare(String(pwdbyuser), pwdindb); // this will return us a boolean value
};

// now we will be creating a "model" based on the above schema

const UserModal = mongoose.model("userCollection", user_schema); // creating a userCollection in the database

module.exports = UserModal;
