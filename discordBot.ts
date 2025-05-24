import { Client, GatewayIntentBits, Events, Message } from 'discord.js';
import WebSocket from 'ws';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const TARGET_CHANNEL_ID = process.env.DISCORD_TARGET_CHANNEL_ID;
const EXTERNAL_WS_URL = process.env.EXTERNAL_WS_URL;

const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, 
  ],
});

let externalWebSocket: WebSocket | null = null;

function connectToExternalSite() {
  console.log(`Attempting to connect to external WebSocket: ${EXTERNAL_WS_URL}`);
  
  if (externalWebSocket && (externalWebSocket.readyState === WebSocket.OPEN || externalWebSocket.readyState === WebSocket.CONNECTING)) {
    console.log('Closing existing external WebSocket connection before reconnecting.');
    externalWebSocket.removeAllListeners(); 
    externalWebSocket.terminate(); 
  }

  const wsClient = new WebSocket(EXTERNAL_WS_URL || '');

  wsClient.on('open', () => {
    console.log('Successfully connected to external WebSocket server.');
    externalWebSocket = wsClient; 
  });

  wsClient.on('message', (data: WebSocket.Data) => {
    console.log('Received message from external WebSocket server:', data.toString());
  });

  wsClient.on('close', (code: number, reason: Buffer) => {
    console.log(`Disconnected from external WebSocket server. Code: ${code}, Reason: ${reason.toString()}. Attempting to reconnect in 5 seconds...`);
    externalWebSocket = null; 
    setTimeout(connectToExternalSite, 5000); 
  });

  wsClient.on('error', (error: Error) => {
    console.error('External WebSocket client error:', error.message);
    if (wsClient.readyState !== WebSocket.CLOSED && wsClient.readyState !== WebSocket.CLOSING) {
        wsClient.terminate(); 
    }
  });
}

function streamToExternalSite(messageData: any): void {
  if (externalWebSocket && externalWebSocket.readyState === WebSocket.OPEN) {
    try {
      externalWebSocket.send(JSON.stringify(messageData));
      console.log('Message streamed to external site:', messageData);
    } catch (error) {
      console.error('Failed to send message to external WebSocket:', error);
    }
  } else {
    console.warn('External WebSocket not connected. Message not streamed:', messageData);
  }
}

discordClient.once(Events.ClientReady, (readyClient) => {
  console.log(`Discord bot logged in as ${readyClient.user.tag}`);
  console.log(`Monitoring channel ID: ${TARGET_CHANNEL_ID}`);
  connectToExternalSite(); 
});

discordClient.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot) return;

  if (message.channel.id === TARGET_CHANNEL_ID) {
    const authorId = message.author.id;
    const authorUsername = message.author.username; 
    const content = message.content;
    const timestamp = message.createdTimestamp; 
    const readableTimestamp = new Date(timestamp).toISOString();

    console.log(`[${readableTimestamp}] New message in ${TARGET_CHANNEL_ID} from ${authorUsername} (${authorId}): ${content}`);

    const messageData = {
      content,
      authorId,
      authorUsername,
      timestamp,
      readableTimestamp,
    };
    streamToExternalSite(messageData);
  }
});

export async function loginToDiscord(): Promise<void> {
  try {
    await discordClient.login(BOT_TOKEN);
  } catch (error) {
    console.error('Failed to log in to Discord:', error);
    process.exit(1);
  }
}