
// const { clientId, guildId, token, publicKey } = require('./config.json');
require('dotenv').config()
const APPLICATION_ID = process.env.APPLICATION_ID 
const TOKEN = process.env.TOKEN 
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set'
const GUILD_ID = process.env.GUILD_ID
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const CALENDAR_ID = process.env.CALENDAR_ID

const WEBURL = 'https://a-bot-ilio.cyclic.cloud'

const axios = require('axios')
const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');

const GoogleCalendar = require('google-calendar');
// Create a Google Calendar client
const googleCalendarClient = new GoogleCalendar({
  apiKey: GOOGLE_API_KEY,
});

const app = express();
// app.use(bodyParser.json());

const discord_api = axios.create({
  baseURL: 'https://discord.com/api/',
  timeout: 3000,
  headers: {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
	"Access-Control-Allow-Headers": "Authorization",
	"Authorization": `Bot ${TOKEN}`
  }
});




app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    console.log(interaction.data.name)
    if(interaction.data.name === 'hola'){
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Hola ${interaction.member.user.username}!`,
        },
      });
    }

    if (interaction.data.name === 'calendar') {
        let events = await googleCalendarClient.getEvents({
            calendarId: CALENDAR_ID,
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        });
        console.log(events)
        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Hola ${interaction.member.user.username}!`,
                embeds: [
                    {
                        title: 'Upcoming Events',
                        description: events.map(event => `**${event.summary}** (${event.start.dateTime})`).join('\n'),
                    },
                ],
            },
        });
    }

    if(interaction.data.name === 'crujir'){
      console.log(WEBURL + 'assets/crujir.png')
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Ya sabes que te voy a crujir ${interaction.member.user.username}!`,
          embeds: [
            {
              image: {
                url: 'https://i.ibb.co/yhpvkYr/crujir.png',
              },
            },
          ],
        },
      });
    }

    if(interaction.data.name === 'dm'){
      // https://discord.com/developers/docs/resources/user#create-dm
      let c = (await discord_api.post(`/users/@me/channels`,{
        recipient_id: interaction.member.user.id
      })).data
      try{
        // https://discord.com/developers/docs/resources/channel#create-message
        let res = await discord_api.post(`/channels/${c.id}/messages`,{
          content:'Yo! I got your slash command. I am not able to respond to DMs just slash commands.',
        })
        console.log(res.data)
      }catch(e){
        console.log(e)
      }

      return res.send({
        // https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data:{
          content:'👍'
        }
      });
    }
  }

});



app.get('/register_commands', async (req,res) =>{
  let slash_commands = [
    {
      "name": "hola",
      "description": "replies with Hola!",
      "options": []
    },
    {
      "name": "crujir",
      "description": "jeje",
      "options": []
    },
    {
      "name": "calendar",
      "description": "eventos",
      "options": []
    },
    {
      "name": "dm",
      "description": "sends user a DM",
      "options": []
    }
  ]
  try
  {
    // api docs - https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
    let discord_response = await discord_api.put(
      `/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
      slash_commands
    )
    console.log(discord_response.data)
    return res.send('commands have been registered')
  }catch(e){
    console.error(e.code)
    console.error(e.response?.data)
    return res.send(`${e.code} error from discord`)
  }
})


app.get('/', async (req,res) =>{
  return res.send('Te voy a crujir')
})


app.listen(8999, () => {

})

