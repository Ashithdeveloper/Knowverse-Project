import User from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(404).json({ error: "Invalid Email" });
    }
    const existingUser = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    // Check if the username or email already exists in the database
    if (existingUser || existingUsername) {
      return res
        .status(404)
        .json({ error: "Username or Email already exists" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password should be at least 8 characters long" });
    }
    //Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create a new user instance with the hashed password
    const newUser = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
      likedPosts: [],
    });
   

    // Save the user to the database
    if (newUser) {
      await newUser.save();
      const token = generateToken(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
        bio: newUser.bio,
        links: newUser.links,
        token,
      });
    } else {
      res.status(400).json({ error: "Failed to create user" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });
  }
};
export const login = async (req, res) => {
   try {
     const { username, password } = req.body;
     const user = await User.findOne({ username });
     const isPasswordCorrect = await bcrypt.compare(password,user?.password||"")
     if(!user || !isPasswordCorrect){
       return res.status(401).json({ error: "Invalid credentials" });
     }
     const token = generateToken(user._id, res);
     res.status(200).json({
       _id: user._id,
       username: user.username,
       fullName: user.fullName,
       email: user.email,
       followers: user.followers,
       following: user.following,
       profileImg: user.profileImg,
       coverImg: user.coverImg,
       bio: user.bio,
       links: user.links,
       token,
     });
   } catch (error) {
     console.log(error);
     res.status(500).json({ error: "Server Error" });
   }
};
export const logout = async (req, res) => {
  try {
    res.cookie("jwt","",{maxAge:0})
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findOne({_id : req.user._id}).select("-password")
    res.status(200).json(user)
    
  } catch (error) {
    console.log(`Error in getMe controller : ${error}`);
    res.status(500).json({ error: "Server Error" });
  }
}