const express = require('express')
const bcrypt = require('bcryptjs')

const router = express.Router()

const User = require('./user-model')

const restricted = (req, res, next) => {
    if(req.session && req.session.user) {
      next()
    } else {
      res
        .status(401)
        .json({message: 'Unauthorized. '})
    }
}

const checkPayload = (req, res, next) => {
    const newUser = req.body
    if(!newUser.username || !newUser.password) {
        res
                .status(401)
                .json({message: 'Missing either the username or password.'})
    } else {
        next()
    }
}

const checkUserUnique = async (req, res, next) => {
    try {
        const { username } = req.body
        const data = await User.findBy(username)
        if(!data.length) {
            next()
        } else {
            res
                    .status(400)
                    .json({message: 'User already exists.'})
        }
    }
    catch(err) {
        res
            .status(500)
            .json({message : err.message})
    }
}

const checkUsernameExists = async (req, res, next) => {
    try {
        const { username } = req.body
        const data = await User.findBy(username)
        if(!data.length) {
            req.userData = data[0]
            res
                .status(401)
                .json({message: 'Could not find user with given username.'})
        } else {
            next()
        }
    }
    catch(err) {
        res
            .status(500)
            .json({message: 'Could not access database.'})
    }
}

router.post('/register', checkPayload, checkUserUnique, async (req, res) => {
    console.log('registering')
    try {
        const { username, password } = req.body
        const hash = bcrypt.hashSync(password, 10)
        const newUser = await User.add({ username: username, password: hash })
        res
            .status(201)
            .json(newUser)
    }
    catch(err) {
        res
            .status(500)
            .json({message: err.message})
    }
})

router.post('/login', checkPayload, checkUsernameExists, (req, res) => {
    console.log('logging in')
    try {
        const { password } = req.body
        const verifies = bcrypt.compareSync(password, req.userData.password)
        if(verifies) {
            console.log('Save a session for user.')
            req.session.user = req.userData
            res.json(`Welcome back , ${req.userData.username}`)
        } else {
            res
                .status(401)
                .json({message: 'Password is incorrect.'})
        }
    }
    catch(err) {
        res
            .status(500)
            .json({message: err.message})
    }
})

router.get('/logout', (req, res) => {
    console.log('goodbye')
    if(req.session && req.session.user) {
       req.session.destroy((err) => {
           if(err) {
               res.json({message: 'You cannot leave.'})
           } else {
               res.json({message: 'Goodbye.'})
           }
       })
    } else {
        res.json({message: 'There was no session.'})
    }
})

router.get('/', restricted, async (req, res) => {
    try {
        const data = await User.get()
        res
            .status(200)
            .json(data)
    }
    catch(err) {
        res
            .status(500)
            .json({message: 'Could not access database.'})
    }
})