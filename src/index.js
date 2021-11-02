const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find((user) => username === user.username);

  if (!userExists)
    return response.status(400).json({ error: "Mensagem do erro" });

  request.selectedUser = userExists;

  return next();
}

app.post("/users", (request, response) => {
  const { username, name } = request.body;

  const usernameAlreadyExists = users.some(
    (user) => username === user.username
  );

  if (usernameAlreadyExists)
    return response.status(400).json({ error: "Mensagem do erro" });

  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { selectedUser } = request;

  return response.json(selectedUser.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { selectedUser } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  };

  selectedUser.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { selectedUser } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  let selectedTodo = selectedUser.todos.find((todo) => todo.id === id);

  if (!selectedTodo)
    return response.status(404).json({ error: "Mensagem do erro" });

  selectedTodo = {
    ...selectedTodo,
    title,
    deadline,
  };

  return response.json(selectedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { selectedUser } = request;

  const { id } = request.params;

  const selectedTodo = selectedUser.todos.find((todo) => todo.id === id);

  if (!selectedTodo)
    return response.status(404).json({ error: "Mensagem do erro" });

  selectedTodo.done = true;

  return response.status(200).json(selectedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { selectedUser } = request;
  const { id } = request.params;

  const selectedTodo = selectedUser.todos.find((todo) => todo.id === id);

  if (!selectedTodo)
    return response.status(404).json({ error: "Mensagem do erro" });

  selectedUser.todos.splice(selectedTodo, 1);

  return response.status(204).send();
});

module.exports = app;
