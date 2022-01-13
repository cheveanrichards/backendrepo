import express from "express";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";
import path from 'path'

// const articlesInfo = {
//   "learn-react": {
//     upvotes: 0,
//     comments: [],
//   },
//   "learn-node": {
//     upvotes: 0,
//     comments: [],
//   },
//   "my-thoughts-on-resumes": {
//     upvotes: 0,
//     comments: [],
//   },
// };

const app = express();
app.use(express.static(path.join(__dirname, '/build')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());

const withDB = async (operations, res) => {
  try {
    const client = await MongoClient.connect(
      "<MongoAtlas url",
      { useNewUrlParser: true }
    );
    const db = client.db("myFirstDatabase");
    await operations(db);
    client.close();
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

// app.get('/hello', (req, res) => res.send('Hello!'));
// app.get("/hello/:name", (req, res) => res.send(`Hello ${req.params.name}`));
// app.post('/hello', (req, res) => res.send(`Hello ${req.body.name}`));

app.get("/api/articles/:name", async (req, res) => {
  withDB(async (db) => {
    const articleName = req.params.name;
    const articlesInfo = await db
      .collection("collection")
      .findOne({ name: articleName });
    res.status(200).json(articlesInfo);
  }, res);

  // try {
  //   const client = await MongoClient
  //     .connect(
  //       "url",
  //       { useNewUrlParser: true }
  //     )
  //     const db = await client.db('myFirstDatabase');
  //     const articlesInfo = await db
  //       .collection('collection')
  //       .findOne({ name: articleName });
  //     res.status(200).json(articlesInfo);
  //     client.close();
  // } catch (error) {
  //   res.status(500).json({message: 'Error'})
  // }
});

app.post("/api/articles/:name/upvote", async (req, res) => {
  const articleName = req.params.name;
  withDB(async (db) => {
    const articlesInfo = await db
      .collection("collection")
      .findOne({ name: articleName });

    await db.collection("collection").updateOne(
      { name: articleName },
      {
        $set: {
          upvotes: articlesInfo.upvotes + 1,
        },
      }
    );

    const updateArticleInfo = await db
      .collection("collection")
      .findOne({ name: articleName });

    res.status(200).json(updateArticleInfo);
  }, res);
});

app.post("/api/articles/:name/add-comment", async (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;
  // const { username, text } = req.body;
  // const articleName = req.params.name;
  // articlesInfo[articleName].comments.push({ username, text });
  // res.status(200).send(articlesInfo[articleName]);
  withDB(async (db) => {
    const articlesInfo = await db
      .collection("collection")
      .findOne({ name: articleName });

    await db.collection("collection").updateOne(
      { name: articleName },
      {
        $set: {
          comments: articlesInfo.comments.concat({ username, text }),
        },
      }
    );
    const updateArticleInfo = await db
      .collection("collection")
      .findOne({ name: articleName });

    res.status(200).json(updateArticleInfo);
  }, res);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
})

app.listen(8000, () => console.log("Listening on port 8000"));
