import PostModel from '../models/Post.js';

export const getPosts = async (req, res) => {
  const querySort = req.query.sort;
  const queryOrder = req.query.order === 'asc' ? querySort : `-${querySort}`;
  const queryFilter = req.query.filter ? { tags: req.query.filter } : {};
  try {
    const posts = await PostModel.find(queryFilter).sort(queryOrder).populate('user').exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to get posts!',
    });
  }
};

export const getPost = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: 'after',
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Failed to get post!',
          });
        }
        if (!doc) {
          return res.status(404).json({
            message: 'Post not found!',
          });
        }
        res.json(doc);
      },
    ).populate('user');
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to get post!',
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    PostModel.findByIdAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            message: 'Failed to delete post!',
          });
        }
        if (!doc) {
          return res.status(404).json({
            message: 'Post not found!',
          });
        }

        res.json({
          success: true,
        });
      },
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to delete posts!',
    });
  }
};

export const addPost = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags,
      imageUrl: req.body.imageUrl,
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to create article!',
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        tags: req.body.tags,
        imageUrl: req.body.imageUrl,
        user: req.userId,
      },
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to update article!',
    });
  }
};

//Get Tags
export const getTags = async (req, res) => {
  try {
    const posts = await PostModel.find().exec();
    const tags = posts.map((obj) => obj.tags).flat();

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Failed to get posts!',
    });
  }
};
