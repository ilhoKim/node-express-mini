const db = require("./data/db");
const express = require("express");

// invoke express server
const port = 5001;
const server = express();
server.use(express.json());

// helper function
const sendUserError = (status, message, res) => {
  res
    .status(status)
    .json({errorMessage: message})
};

// run our file from terminal
// runtime environment, which called 'node' here.
// >>node server.js

// add endpoints
// 1st arg: route where a resource can be interacted with
// 2nd arg: callback to deal with sending responses, and handling incoming
server.get("/", (req, res) => {
  const { id } = req.query;
  res.send("=== Express Sever Online ===");
});

server.post("/api/users", (req, res) => {
  const { name, bio } = req.body; // destructure user request
//   const name = req.body.name;
//   const bio = req.body.bio;

  if (!name || !bio) {
    // res.status(400).send("Must provide name and bio");

    res
      .status(400)
      .json({ errorMessage: "Please provide name and bio for the user." });
      return; // exit right after error message to make sure the following codes do not execuete
  }
  db
    .insert({ name, bio }) // send user as an object which as name and bio. insert() is given as a db method
    .then(response => {
      res.status(201).json(response);
    }) // We get promise from the server method. Therefore, we can use then()
    .catch(error => {
      console.log(error);
      sendUserError(400, "Field not found", res);
      return;
    });
});

server.get("/api/users", (req, res) => {
  db
    .find()
    .then(users => {
      res.json({ users });
    })
    .catch(error => {
      sendUserError(500, "The users information could not be retrieved.", res);
      return;
    });
});

server.get("api/users/:id", (req, res) => {
  // pull id off of req.params;
  const { id } = req.params; // or destructure by using {id}
  // invoke proper db.method(id) passing in the id
  // handle the promise like above
  db
    .findById(id)
    .then(user => {
      if (user.length === 0) {
        sendUserError(404, "User with that id not fount", res);
        return;
      }
      res.json(user);
    })
    .catch(error => {
      sendUserError(500, "Error looking up user", res);
    });
});

server.delete("api/users/:id", (req, res) => {
  const { id } = req.params;
  db
    .remove(id)
    .then(response => {
      if (response === 0) {
        sendUserError(404, "The user with that ID does not exist.", res);
        return;
      }
      res.json({ success: `User with id: ${id} removed from the syste` });
    })
    .catch(error => {
      sendUserError(500, "The user could not be removed", res);
      return;
    });
});

server.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, bio } = req.body;

  if ( !name || !bio) {
    sendUserError(400, "Must provide name and bio", res);
    return;
  }

  db
    .update(id, { name, bio })
    .then(response => {
      if (response == 0) {
        sendUserError(404, "The user with the specified ID does not exist.", res);
        return;
      } 
      db
        .findById(id)
        .then(user => {
          if (user.length === 0) {
            sendUserError(404, "User with that id not fount", res);
            return;
          }
          res.json(user);
        })
        .catch(error => {
          sendUserError(500, "Error looking up user", res);
        });
      })
    .catch(error => {
      sendUserError(500, "Something bad happened in the DB", res)
      return;
    })
});

// now server is something we can work on with chain of methods
// Callback is given to the server to print out a message
// server.listen(port, () => console.log(`Server running on ${port}`));
server.listen(port, () => console.log(`Server running on port ${port}`));
