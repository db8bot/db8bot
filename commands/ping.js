exports.run = function (client, message) {
  if (client.optINOUT.get(message.author.id) != undefined) {
    if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
  } var guild = message.guild;
  message.channel.send(':ping_pong: Pinging...').then((msg) => {
    msg.edit(`:ping_pong: Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
  });
  client.logger.log('info', `ping command used by ${message.author.username} Time: ${Date()} Guild: ${guild}`)
}