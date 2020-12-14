const express = require('express')
const session = require('express-session')
const KnexSessionStore = require('connect-session-knex')(session)

const usersRouter = require('./users/user-router')

const server = express()

const config = {
    name: "monkey",
    secret: "keep it secret, keep it safe!",
    cookie: {
      maxAge: 1000 * 60 * 60,
      secure: false,
      httpOnly: true,

    },
    resave: false,
    saveUninitialized: false,
    store: new KnexSessionStore({
      knex: require("../database/connection.js"),
      tablename: "sessions",
      sidfieldname: "sid",
      createtable: true,
      clearInterval: 1000 * 60 * 60,
    }),
  }

  server.use(session(config))
  server.use(express.json())

  server.use('api/users', usersRouter)

  module.exports = server

