const express = require('express');
const { interfaces } = require('mocha');
const router = express.Router();
const mongoose = require('mongoose');

main().catch(err => console.log(err));
let data = [];
const Todo = mongoose.model('Todo', { _id: Number, title: String, order: Number, completed: Boolean, createdOn: Date });

async function main() {
  await mongoose.connect('mongodb://localhost:27017/tododb');
  console.log("CONNECTION SUCCESS");
  data = await Todo.find().exec();
}

router.get('/', function (req, res) {
  res.status(200).json(data);
});

router.get('/:_id', function (req, res) {
  let found = data.find(function (item) {
    return item._id === parseInt(req.params._id);
  });

  if (found) {
    res.status(200).json(found);
  } else {
    res.sendStatus(404);
  }
});

router.post('/', function (req, res) {
  let itemIds = data.map(item => item._id);
  let orderNums = data.map(item => item.order);

  let newId = itemIds.length > 0 ? Math.max.apply(Math, itemIds) + 1 : 1;
  let newOrderNum = orderNums.length > 0 ? Math.max.apply(Math, orderNums) + 1 : 1;

  let newItem = {
    _id: newId,
    title: req.body.title,
    order: newOrderNum,
    completed: false,
    createdOn: new Date()
  };

  data.push(newItem);
  const newOne = new Todo(newItem);
  newOne.save().then(console.log("SAVED"));
  res.status(201).json(newItem);
});

router.put('/:_id', function (req, res) {
  let found = data.find(function (item) {
    return item._id === parseInt(req.params._id);
  });
  if (found) {
    let updated = {
      _id: found._id,
      title: req.body.title ? req.body.title : found.title,
      order: req.body.order ? req.body.order : found.order,
      completed: req.body.completed ? req.body.completed : found.completed,
      createdOn: req.body.createdOn ? req.body.createdOn : found.createdOn
    };

    let targetIndex = data.indexOf(found);
    data.splice(targetIndex, 1, updated);

    Todo.findOneAndDelete({_id: req.params._id}).exec();
    const updatedOne = new Todo(updated);
    updatedOne.save().then(console.log("UPDATED"));

    res.sendStatus(204);
  } else {
    res.sendStatus(404);
  }
});

router.delete('/:_id', function (req, res) {
  let found = data.find(function (item) {
    return item._id === parseInt(req.params._id);
  });

  if (found) {
    let targetIndex = data.indexOf(found);

    data.splice(targetIndex, 1);
    Todo.findOneAndDelete({_id: req.params._id}).exec();
  }
  res.sendStatus(204);
});

module.exports = router;
