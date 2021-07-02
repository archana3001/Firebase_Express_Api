/* eslint-disable max-len */
/* eslint-disable brace-style */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as firebaseHelper from "firebase-functions-helper";
import * as express from "express";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp(functions.config().firebase);

// create object of firestore, express
const db=admin.firestore();
const app =express();
const main=express();

const profileCollection="profile"; // profile is one of collection in firestore

main.use("/api/v1", app);
main.use(express.json()); //    Used to parse JSON bodies
main.use(express.urlencoded()); //  Parse URL-encoded bodies


//   crud routes for your api
interface User{
    username: string,
    email: string,
    password: string
}
// 1. add profile
app.post("/users", async ( req, res )=>{
  try {
    const user: User={
      username: req.body["username"],
      email: req.body["email"],
      password: req.body["password"],
    };
    const newDoc = await firebaseHelper.firestoreHelper
        .createNewDocument(db, profileCollection, user);
    res.status(201).send(`Created new profile ${newDoc.id} please login!!`);
  }
  catch (err) {
    res.status(400).send(err);
  }
});
// Update new profile
app.patch("/users/:profileID", async (req, res) => {
  const updatedDoc = await firebaseHelper.firestoreHelper.updateDocument(db, profileCollection, req.params.profileID, req.body);
  res.status(204).send(`Update a new profile: ${updatedDoc}`);
});
// View a user
app.get("/users/:profileID", (req, res) => {
  firebaseHelper.firestoreHelper.getDocument(db, profileCollection, req.params.profileID)
      .then((doc) => res.status(200).send(doc))
      .catch((error) => res.status(400).send(`Cannot get profile: ${error}`));
});
// View all users
app.get("/users", (req, res) => {
  firebaseHelper.firestoreHelper.backup(profileCollection).then((data) => res.status(200).send(data))
      .catch((error) => res.status(400).send(`Cannot get profiles: ${error}`));
});
// Delete a user
app.delete("/users/:profileID", async (req, res) => {
  const deletedContact = await firebaseHelper.firestoreHelper
      .deleteDocument(db, profileCollection, req.params.profileID);
  res.status(204).send(`profile is deleted: ${deletedContact}`);
});

// / webApi in your function name and you will pass main as a parameter
export const webApi=functions.https.onRequest(main);
