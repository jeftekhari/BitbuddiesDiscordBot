"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = __importStar(require("ws"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app); // Node's http.Server
const wss = new ws_1.WebSocketServer({ server }); // ws.WebSocketServer
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('Backend server is running with TypeScript!');
});
wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    ws.on('message', (message) => {
        console.log('Received from client:', message.toString());
        // Example: Echo message back to the client
        // ws.send(`Server received: ${message.toString()}`);
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
    ws.on('error', (error) => {
        console.error('WebSocket error on client connection:', error);
    });
    ws.send('Welcome! You are connected to the WebSocket server (from TypeScript).');
});
// Function to broadcast messages to all connected WebSocket clients
// This function would be called by your Discord bot logic later
function broadcastToWebSockets(messageData) {
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.default.OPEN) {
            try {
                client.send(JSON.stringify(messageData));
            }
            catch (error) {
                console.error('Error sending message to client:', error);
            }
        }
    });
}
// Example of how you might make it accessible or how your bot module might interact:
// For now, let's just log that it's available.
// Later, your Discord bot module will need to import this or have access to 'wss'
console.log('broadcastToWebSockets function is available conceptually.');
server.listen(PORT, () => {
    console.log(`HTTP and WebSocket server listening on port ${PORT}`);
});
// Export wss or broadcastToWebSockets if other modules need it directly
// For example:
// export { wss, broadcastToWebSockets };
// Or structure your project so the Discord bot module can import and call broadcastToWebSockets. 
