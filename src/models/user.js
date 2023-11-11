const mongoose = require('mongoose')
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
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








