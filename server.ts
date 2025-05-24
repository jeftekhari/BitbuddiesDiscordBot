import express, { Express, Request, Response } from 'express';
import http from 'http';

import { loginToDiscord } from './discordBot'; 

const app: Express = express();
const server = http.createServer(app);

const PORT: string | number = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Backend server is running with TypeScript!');
});


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