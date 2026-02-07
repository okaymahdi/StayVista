/** Get All Rooms Controller */
const { getDB } = require('../config/db');
const { asyncHandler } = require('../middlewares/async.middleware');
const getAllRoomsController = asyncHandler(async (req, res) => {
  const db = getDB();
  const roomsCollection = db.collection('rooms');
  const cursor = roomsCollection.find();
  const rooms = await cursor.toArray();
  res.send(rooms);
});

module.exports = { getAllRoomsController };
