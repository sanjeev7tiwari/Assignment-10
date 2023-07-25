
const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());
const session = require('express-session');
app.use(express.urlencoded({ extended: true }));
const users = [
  { username: "sanjeev", password: "sanjeev" },
];
app.use(session({
  secret: 'maikyubatau',
  resave: false,
  saveUninitialized: true,
}))
// Serve static files
app.get("/contact", function (req, res) {
  if(!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  res.sendFile(__dirname + "/contact.html");
});

app.get("/about", function (req, res) {
  if(!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  res.sendFile(__dirname + "/about.html");
});

app.get("/", function (req, res) {
  if(!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  res.sendFile(__dirname + "/home.html");
});

app.get("/todo", function (req, res) {
  if(!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  res.sendFile(__dirname + "/todo.html");
});

app.get("/todoScript.js", function (req, res) {
  if(!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  res.sendFile(__dirname + "/todoScript.js");
});

// Route to handle adding a new todo
app.post("/todo", function (req, res) {
  if(!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  saveTodoInFile(req.body, function (err, savedTodo) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    res.status(200).json(savedTodo);
  });
});

// Route to get all todos
app.get("/todo-data", function (req, res) {
  if(!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }
  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    res.status(200).json(data);
  });
});

// Route to delete a todo
app.delete("/delete-todo/:id", function (req, res) {
  const todoId = req.params.id;
  deleteTodoById(todoId, function (err) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    res.status(200).send("success");
  });
});

// Route to update a todo
app.patch("/update-todo/:id", function (req, res) {
  const todoId = req.params.id;
  const updates = req.body;

  updateTodoById(todoId, updates, function (err) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    res.status(200).send("success");
  });
});
//login
app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});
app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});
app.post("/login", function (req, res) {
  const username =req.body.username;
  const password = req.body.password;
    for (const user of users) {
      if (user.username === username && user.password === password) {
        req.session.isLoggedIn =true;
        req.session.username=username;
        res.redirect('/');
        return;
      }
    }
    res.redirect('/error');
  //console.log(username, password);
})
app.get('/error',(req, res)=>{
      res.sendFile(__dirname + "/error.html");
})
app.post("/signup", function (req, res) {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirm_password = req.body.confirm_password;

  // Check if the passwords match
  if (password !== confirm_password) {
    res.status(400).send("Passwords do not match.");
    return;
  }
  for (const user of users) {
    if (user.username === username) {
      res.status(400).send("Username already exists.");
      return;
    }
  }
  const newUser = { username, email, password };
  users.push(newUser);
  res.status(200).send("User account created successfully.");
});
app.listen(3000, function () {
  console.log("server on port 3000");
});
app.get("/logout", function (req, res) {
  // Clear the session
  req.session.isLoggedIn = false;
  req.session.username = null;

  // Redirect to the login page
  res.redirect("/login");
});
app.get('/loginPage', (req, res) => {
  res.redirect('/login');
});
// Existing functions for handling todos
function readAllTodos(callback) {
  fs.readFile("./database.txt", "utf-8", function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    let todos = [];
    if (data.length !== 0) {
      todos = JSON.parse(data);
    }

    callback(null, todos);
  });
}

function saveTodoInFile(todo, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    const id = Date.now().toString(); // Generate a unique id
    const savedTodo = { ...todo, id }; // Add the 'id' property to the todo

    data.push(savedTodo);

    fs.writeFile("./database.txt", JSON.stringify(data), function (err) {
      if (err) {
        callback(err);
        return;
      }

      callback(null, savedTodo);
    });
  });
}

function deleteTodoById(id, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    const updatedTodos = data.filter((todo) => todo.id !== id);

    fs.writeFile("./database.txt", JSON.stringify(updatedTodos), function (err) {
      if (err) {
        callback(err);
        return;
      }

      callback(null);
    });
  });
}

function updateTodoById(id, updates, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    const updatedTodos = data.map((todo) => {
      if (todo.id === id) {
        return { ...todo, ...updates };
      }
      return todo;
    });

    fs.writeFile("./database.txt", JSON.stringify(updatedTodos), function (err) {
      if (err) {
        callback(err);
        return;
      }

      callback(null);
    });
  });
}
