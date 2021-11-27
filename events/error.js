module.exports = async error => {
    console.error(`An error event was sent by Discord.js: \n${JSON.stringify(error)}`, 'error')
}
