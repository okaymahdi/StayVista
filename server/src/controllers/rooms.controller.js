const { ObjectId } = require('mongodb');
const { getDB, getCollection } = require('../config/db');
const { asyncHandler } = require('../middlewares/async.middleware');

/** Get All Rooms Controller */
const getAllRoomsController = asyncHandler(async (req, res) => {
  const roomsCollection = getCollection('rooms');
  const cursor = roomsCollection.find();
  const rooms = await cursor.toArray();
  res.send(rooms);
});

/** Get Room by ID Controller */
const getRoomByIdController = asyncHandler(async (req, res) => {
  const roomsCollection = getCollection('rooms');
  const roomId = req.params.id;
  const query = { _id: new ObjectId(roomId) };
  const room = await roomsCollection.findOne(query);
  if (!room) {
    return res.status(404).send({ message: 'Room not found' });
  }
  res.send(room);
});

module.exports = { getAllRoomsController, getRoomByIdController };
