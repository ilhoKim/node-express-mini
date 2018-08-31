const express = require('express');
const db = require('./data/db');

// invoke express server
const port = 5001;
const server = express();
server.use(express.json());

// run our file from terminal
// runtime environment, which called 'node' here.
// >>node server.js

// add endpoints
// 1st arg: route where a resource can be interacted with
// 2nd arg: callback to deal with sending responses, and handling incoming
server.get('/', (req, res) => {
    const { id } = req.params;
    console.log(id);
    res.send("Hello from express");
});

server.post('/api/users', (req, res) => {
  const { name, bio, created_at, updated_at } = req.body; // destructure user request
  if (!name || !bio) {
      sendUserError(400, 'Must provide name and bio', res);
      return;
  } 
  db
    .insert({ name, bio, created_at, updated_at }) // send user as an object which as name and bio. insert() is given as a db method
    .then(response => {
      res.status(201).json(response);
    }) // We get promise from the server method. Therefore, we can use then()
    .catch(error => {
        console.log(error);
        sendUserError(400, error, res);
        rerurn;
    });
});

server.get('/api/users', (req, res) => {
  db
    .find()
    .then(users => {
      res.json({ users });
    })
    .catch(error => {
      sendUserError(500, 'The users information could not be retrieved.', res);
      return;
    });
});

server.get('api/users/:id', (req, res) => {
  // pull id off of req.params;
  const { id } = req.params; // or destructure by using {id}
  // invoke proper db.method(id) passing in the id
  // handle the promise like above
  db
    .findById(id)
    .then(user => {
      if (user.length === 0) {
          sendUserError(404, 'User with that id not fount', res);
          return;
      }
      res.json(user);
    })
    .catch(error => {
      sendUserError(500, 'Error looking up user', res);
    });
});


server.delete('api/users/:id', (req, res) => {
    const { id } = req.params;
    db
      .remove(id)
      .then(response => {
        if(response === 0) {
            sendUserError(404, 'The user with that ID does not exist.', res);
            return;
        }
        res.json({success: `User with id: ${id} removed from the syste`});
    })
      .catch(error => {
        sendUserError(500, 'The user could not be removed', res);
        return;
      });
  });

  server.put('/api/users/:id', (req, res) => {
      const { id } = req.params;
      const { name, bio } = req.body;

      db
        .update(id, { name, bio })
  });

// now server is something we can work on with chain of methods
// Callback is given to the server to print out a message
// server.listen(port, () => console.log(`Server running on ${port}`));
server.listen(port, () => console.log(`Server running on port ${port}`));
