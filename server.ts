import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import express, { Express, Request, Response, RequestHandler } from 'express';
import http from 'http';
import { TextChannel, DMChannel, NewsChannel, ThreadChannel } from 'discord.js';

import { loginToDiscord, discordClient, BUD_NOTIF_CHANNEL_ID } from './discordBot'; 

const app: Express = express();
const server = http.createServer(app);

const PORT: string | number = process.env.PORT || 3000;

// Add JSON middleware to parse request bodies
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Backend server is running with TypeScript!');
});

// HTTP API for outbound notifications
app.post('/api/send-message', (async (req: Request, res: Response) => {
  try {
    const { type, petName, level, origin, playerName } = req.body;
    
    // Validate required fields
    if (!type) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: type' 
      });
    }

    // Check if Discord client is ready
    if (!discordClient.isReady()) {
      return res.status(503).json({ 
        success: false, 
        error: 'Discord bot is not ready' 
      });
    }

    let message = '';
    
    if (type === 'levelUp') {
      if (!petName || !level || !origin || !playerName) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields for levelUp: petName, level, origin, playerName' 
        });
      }
      message = `🎉 *${playerName}* just leveled up **${petName}** to **Level ${level}** from ${origin}!`;
    } else {
      // Handle other message types or allow custom messages
      message = req.body.message || `Notification: ${type}`;
    }

    // Get the notification channel using the environment variable with non-null assertion
    const channel = discordClient.channels.cache.get(BUD_NOTIF_CHANNEL_ID!);
    
    if (!channel) {
      return res.status(404).json({ 
        success: false, 
        error: 'Notification channel not found' 
      });
    }

    // Check if channel is a text channel and cast it properly
    if (!channel.isTextBased()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Notification channel is not a text channel' 
      });
    }

    // Cast to text-based channel type and send the message
    const textChannel = channel as TextChannel | DMChannel | NewsChannel | ThreadChannel;
    await textChannel.send(message);
    
    console.log(`Message sent to notification channel: ${message}`);
    res.status(200).json({ success: true, message: 'Message sent successfully' });
    
  } catch (error) {
    console.error('Error sending message to Discord:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}) as RequestHandler);

async function startServer() {
  try {
    server.listen(PORT, () => {
      console.log(`HTTP server listening on port ${PORT}`);
     
      loginToDiscord().then(() => {
        console.log("Discord bot login sequence initiated.");
      }).catch(error => {
        console.error("Error during Discord bot login sequence:", error);
      });
    });

  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
console.log('Server stated');