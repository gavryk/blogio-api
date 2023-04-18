import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import UserModel from '../models/User.js';

export const register = async (req, res) => {
  try {
    //hash password
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    //create data doc
    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });
    //save info in db
    const user = await doc.save();
    //save token
    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret_id',
      {
        expiresIn: '30d',
      },
    );
    //Get all data without hash
    const { passwordHash, ...userData } = user._doc;
    //Return information
    res.json({ ...userData, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to register!',
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: 'Invalid login or password',
      });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

    if (!isValidPass) {
      return res.status(400).json({
        message: 'Invalid login or password',
      });
    }
    //create token
    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret_id',
      {
        expiresIn: '30d',
      },
    );

    //Get all data without hash
    const { passwordHash, ...userData } = user._doc;
    //Return information
    res.json({ ...userData, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to authenticate!',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found!',
      });
    }

    //Get all data without hash
    const { passwordHash, ...userData } = user._doc;
    //Return information
    res.json({ ...userData });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'No Access!',
    });
  }
};
