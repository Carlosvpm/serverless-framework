import AWS from "aws-sdk"
import express from "express";
import serverless from 'serverless-http';


const app = express()

const USERS_TABLE = process.env.USERS_TABLE

const dynamoDbClient = new AWS.DynamoDB.DocumentClient()

app.use(express.json())


app.get("users/:userId", async (req, res) => {
    const params = {
        TableName: USERS_TABLE,
        Key: {
            userId: req.params.userId
        }
    }

    try {
        const { Item } = await dynamoDbClient.get(params).promise()
        if (!Item) {
            return res.status(404).json({
                error: "User Not Found"
            })
        } else {
            const {userId, name, email} = Item
            res.json({userId, name, email})
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({error: "An unexpected error occurred"})

    }
})

app.post("/users", async (req, res) => {
  const { userId, name, email } = req.body;

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId,
      name,
      email,
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    return res.json({ userId, name, email });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Could not create user" });
  }
});

app.use((req, res, next) => {
    return res.status(404).json({
        error: "not_found"
    })
})

export const handler = serverless(app);