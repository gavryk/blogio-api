import express from 'express';
import fs from 'fs';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import { registerValidator, loginValidator, postCreateValidator } from './validations.js';
import { checkAuth, handleValidationErrors } from './utils/index.js';

import { getMe, login, register } from './controllers/UserController.js';
import {
  addPost,
  deletePost,
  getPost,
  getPosts,
  getTags,
  updatePost,
} from './controllers/PostController.js';

//.env config
dotenv.config({ debug: true });
//DB Connect
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname.replaceAll(' ', '_'));
  },
});
const upload = multer({ storage });

//Routes
//Auth
app.post('/auth/login', loginValidator, handleValidationErrors, login);
app.post('/auth/register', registerValidator, handleValidationErrors, register);
app.get('/auth/me', checkAuth, getMe);

//Posts
app.get('/posts', getPosts);
app.get('/posts/:id', getPost);
app.post('/posts', checkAuth, postCreateValidator, handleValidationErrors, addPost);
app.patch('/posts/:id', checkAuth, handleValidationErrors, updatePost);
app.delete('/posts/:id', checkAuth, deletePost);

//Tags
app.get('/tags', getTags);

//Upload Route
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.filename}`,
  });
});

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Server is running!');
});
