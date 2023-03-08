const express = require('express')
const router = express.Router()
const os = require('os')
const process = require('process')
const pkg = require('../package.json')

router.get('/', (req, resApp) => {
    // no api key needed
    const response = {
        status: true,
        version: pkg.version,
        processUptime: process.uptime(),
        // server information
        arch: os.arch(),
        platform: os.platform(),
        cpus: os.cpus(),
        load: os.loadavg(),
        uptime: os.uptime(),
        totalMem: os.totalmem(),
        mem: process.memoryUsage()
    }
    resApp.json(response)
})

module.exports = router
