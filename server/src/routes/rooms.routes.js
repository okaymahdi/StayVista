const express = require('express');
const { getAllRoomsController } = require('../controllers/rooms.controller');
const roomsRouter = express.Router();

/** Get All Rooms Router */
roomsRouter.get('/rooms', getAllRoomsController);

module.exports = { roomsRouter };
