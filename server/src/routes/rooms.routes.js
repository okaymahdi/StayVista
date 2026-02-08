const express = require('express');
const {
  getAllRoomsController,
  getRoomByIdController,
} = require('../controllers/rooms.controller');
const roomsRouter = express.Router();

/** Get All Rooms Router */
roomsRouter.get('/rooms', getAllRoomsController);

/** Get Room by ID Router */
roomsRouter.get('/room/:id', getRoomByIdController);

module.exports = { roomsRouter };
