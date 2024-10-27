const mongoose = require('mongoose')
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  wins: {
    type: Number,
    default: 0
  },
})

const User = mongoose.model('User', userSchema);

module.exports = User
