const mongoose = require('mongoose')
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetTokenExpiration: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  wins: {
    type: Number,
    default: 0
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

// a senha sera salva no banco de dados encriptografada
userSchema.pre('save', function(next) {
  bcrypt.hash(this.password, 10).then(hash => {
    this.password = hash;
    next();
  }).catch(error => {
    console.error('Error hashing password', error);
  })
})

const User = mongoose.model('User', userSchema)

module.exports = User








