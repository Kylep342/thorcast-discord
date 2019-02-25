const Discord = require('discord.js')
const Utils = require('./thorcast-utils.js')


BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
THORCAST_API_URL = process.env.THORCAST_API_URL

const client = new Discord.Client({autoReconnect: true})


client.on('message', (receivedMessage) => {
    if (receivedMessage.author === client.user) {
        return
    }
    const REPrefix = `^(?:(?:!thor(?:cast)?)|(?:${client.user.toString()}))`
    const isToThorcast = new RegExp(REPrefix, 'gm')
    // handle all commands starting with !thor, !thorcast, or @Thorcast
    if (isToThorcast.exec(receivedMessage.content)) {
        Utils.processCommand(receivedMessage, REPrefix)
    }
})


client.login(BOT_TOKEN)