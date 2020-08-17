exports.run = (client, message, args) => {
  if (!args || args.length < 1) return message.reply("Must provide a command name to reload.");
  client.logger.log('info', `reload command used by ${message.author.tag} Time: ${Date()} Guild: ${message.guild}`)
  const commandName = args[0];
  if (message.author.id != client.config.owner) {
    message.reply("Insufficient permissions.")
    return;
  } else {
    // Check if the command exists and is valid
    if (!client.commands.has(commandName)) {
      return message.reply("That command does not exist");
    }
    // the path is relative to the *current folder*, so just ./filename.js
    delete require.cache[require.resolve(`./${commandName}.js`)];
    // We also need to delete and reload the command from the client.commands Enmap
    client.commands.delete(commandName);
    const props = require(`./${commandName}.js`);
    client.commands.set(commandName, props);
    message.reply(`The command ${commandName} has been reloaded`);
  }
};