const UserModal = require("../Modals/user_modal"); // importing the user_modal to perform certain operation on the collection
const jwt = require("jsonwebtoken"); // importing the jsonwebtoken library to create a unique token

// creating a singup route handler middleware function
const signup = async (request, response) => {
  try {
    const { fullname, email, password, confirmPassword } = request.body; // destructuring the request body to get all those fields specified within the braces
    // checking if the user has provided all the required fields or not
    if ((!fullname, !email, !password, !confirmPassword)) {
      return response
        .status(400)
        .json({ error: "one or more fields are missing" });
    }
    // now we will check if the email is already registered in the database or not

    const existingUser = await UserModal.findOne({ email });
    if (existingUser) {
      return response.status(400).json({ error: "user exists! kindly login" });
    }

    //after all these checks we will be registering the user in the database

    const user = await UserModal.create(request.body);
    return response
      .status(201)
      .json({ message: "Registration successful", user });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};
// creating login route handler middleware function
const login = async (request, response) => {
  try {
    // destructuring email and password from the request body
    const { email, password } = request.body;
    // we will check whether the user has provided all the mandatory fields or not

    if (!email || !password) {
      return response
        .status(400)
        .json({ error: "one or the other fields are missing" });
    }
    // now we will check whether the email already exists or not
    const existingUser = await UserModal.findOne({ email }).select("+password"); // the select is allowing us to include the password field in the query result so that we can carry the operation of password comparision
    if (!existingUser) {
      return response
        .status(400)
        .json({ error: "email does not exist! kindly signup" });
    }
    // comparing the password below using instance method
    else if (
      !(await existingUser.passwordComparision(password, existingUser.password))
    ) {
      return response.status(400).json({ error: "password does not match" });
    }

    // if everything is okay, then we are going to generate a jwt token for the user and provide him

    const tokengeneration = (id) => {
      return jwt.sign({ id }, process.env.SECRET_STRING, {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      }); // passing the id in the payload, the secret string and the token expiration time is coming from the environment file
    };
    const token = tokengeneration(existingUser._id);
    return response
      .status(200)
      .json({ message: "logged in successfully", token, existingUser });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

// creating a route handler middleware function to edit the profile of a user

const editProfile = async (request, response) => {
  try {
    const { fullname, email, image } = request.body; // extracting fullname, email, image from request body
    // we will check if the fullname and email fields are not empty
    if (!fullname || !email) {
      return response.status(400).json({ error: "Missing fields" });
    }
    const userId = request.user._id; // extracting the logged in user id who wants to change his profile

    const updateProfile = await UserModal.findByIdAndUpdate(
      userId,
      {
        fullname,
        email,
        image,
      },
      { new: true, runValidators: true }
    );
    return response
      .status(201)
      .json({ message: "profile updated successfully", updateProfile });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

// creating route handler middleware function to follow a user

const followUser = async (request, response) => {
  try {
    // we would require the author id of the user whose profile i  want to follow
    const { authorId } = request.params;

    // Check if the author with that id exists in the database
    const validAuthorId = await UserModal.findById(authorId);

    if (!validAuthorId) {
      return response.status(400).json({ error: "author not found" });
    }
    // we will also check that a logged in user does not follow his own profile
    const userId = request.user._id; // this is the logged in user id which will be pushed in the followers array
    if (userId.toString() === authorId.toString()) {
      return response
        .status(400)
        .json({ error: "you are not allowed to follow your own profile" });
    }

    // now we will check if the logged user is already following the author of that post

    // Check if the logged-in user is already following the author
    if (validAuthorId.followers.includes(userId)) {
      return response.status(400).json({ error: "You are already a follower" });
    }

    if (validAuthorId.following.includes(authorId)) {
      return response.status(400).json({ error: "You are already  following" });
    }

    // basically this will be a put request that is updation so -

    const updatedAuthor = await UserModal.findByIdAndUpdate(
      authorId,
      { $push: { followers: userId } },
      { new: true, runValidators: true }
    );

    // Update the 'following' array of the logged-in user
    const updatedUser = await UserModal.findByIdAndUpdate(
      userId,
      { $push: { following: authorId } },
      { new: true, runValidators: true }
    );

    return response.status(201).json({
      message: "user followed successfully",
      updatedAuthor,
      updatedUser,
    });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

// creating a route handler middleware function to unfollow a user

const unfollowUser = async (request, response) => {
  try {
    // checking if the authorid of the tweet exists or not
    const { authorId } = request.params;
    const validAuthorId = await UserModal.findById(authorId);

    if (!validAuthorId) {
      return response.status(400).json({ error: "Author not found" });
    }
    // now we will go ahead and remove the userId if it exists in the followers array
    const userId = request.user._id;

    const unfollowUpdatedAuthor = await UserModal.findByIdAndUpdate(
      authorId,
      { $pull: { followers: userId } },
      { new: true, runValidators: true }
    );

    const unfollowUpdatedUser = await UserModal.findByIdAndUpdate(
      userId,
      { $pull: { following: authorId } },
      { new: true, runValidators: true }
    );

    return response.status(201).json({
      message: "unfollowed successfully",
      unfollowUpdatedAuthor,
      unfollowUpdatedUser,
    });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

// check if the user is following a specific author of the post or not

const getFollowingStatus = async (request, response) => {
  try {
    const { authorId } = request.params;
    const userId = request.user._id;

    // Checking if the logged-in user is following the author
    const isFollowingUser = await UserModal.findById(userId);

    // Checking if the authorId is included in the 'following' array
    const isFollowing = isFollowingUser
      ? isFollowingUser.following.includes(authorId)
      : false;
    response.status(200).json({ isFollowing });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};

// here we are creating a protected route(middleware function) to check whether the user is logged in or not

const protectRoute = async (request, response, next) => {
  try {
    // first we will find if the token is present or not and starts with "Bearer" or not
    const { authorization } = request.headers; // destructuring the request headers to get the authorization string
    if (!authorization || !authorization.startsWith("Bearer")) {
      return response.status(400).json({ error: "Invalid authorization" });
    }
    // now we will extract the token from the Authorization string
    const token = authorization.split(" ")[1]; // basically the token is present at the 1 index value in the array
    // now we will match the token that is validate the token (technically matching the id which was passed in the payload)
    jwt.verify(
      token,
      process.env.SECRET_STRING,
      async (error, decodedtoken) => {
        if (error) {
          return response.status(400).json({ error: "invalid token" });
        }
        const { id } = decodedtoken; // destructuring the id from the decoded token
        // now we will check whether the user with that id exists in the database or not
        const user = await UserModal.findOne({ _id: id });
        if (user) {
          request.user = user; // adding the user to the request object
          // allow user to access route
          next(); // after that it will go to the next middleware
        } else {
          return response.status(400).json({ error: "Invalid user" });
        }
      }
    );
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

module.exports = {
  signup,
  login,
  editProfile,
  followUser,
  unfollowUser,
  getFollowingStatus,
  protectRoute,
};
