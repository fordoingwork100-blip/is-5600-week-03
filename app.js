// app.js

const path = require('path');
const express = require('express');
const EventEmitter = require('events');

const port = process.env.PORT || 3000;
const app = express();

// Create an emitter instance to broadcast chat messages across all connected clients
const chatEmitter = new EventEmitter();

/**
 * Responds with plain text
 * @param {*} req 
 * @param {*} res 
 */
function respondText(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('hi');
}

/**
 * Responds with a simple JSON object containing a message and an array of numbers
 * @param {*} req 
 * @param {*} res 
 */
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

/**
 * Takes a query parameter named 'input' and returns it in multiple formats
 * Includes:
 *  - Normal text
 *  - Uppercase text
 *  - Character count
 *  - Reversed text
 * @param {*} req 
 * @param {*} res 
 */
function respondEcho(req, res) {
  const { input = '' } = req.query;
  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

/**
 * Serves the main chat application HTML file (chat.html)
 * @param {*} req 
 * @param {*} res 
 */
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

/**
 * Handles chat messages sent from the client
 * Emits the message using EventEmitter so it can be streamed to all clients
 * @param {*} req 
 * @param {*} res 
 */
function respondChat(req, res) {
  const { message } = req.query;
  if (message && message.trim() !== '') {
    chatEmitter.emit('message', message);
  }
  res.end();
}

/**
 * Establishes a Server-Sent Events (SSE) connection for real-time updates
 * Each new chat message triggers an event sent to connected clients
 * Removes listener when client disconnects
 * @param {*} req 
 * @param {*} res 
 */
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

//  STATIC FILES 
app.use(express.static(__dirname + '/public'));

//  ROUTE HANDLERS
app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

// 404 HANDLER 
app.use((req, res) => {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// SERVER START 
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
