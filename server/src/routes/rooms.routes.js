const express = require('express');
const {
  getAllRoomsController,
  getRoomByIdController,
} = require('../controllers/rooms.controller');
const roomsRouter = express.Router();

/** 6.2 Get All Rooms Router */
roomsRouter.get('/rooms', getAllRoomsController);

/** 11.2 Get Room by ID Router */
roomsRouter.get('/room/:id', getRoomByIdController);

module.exports = { roomsRouter };
