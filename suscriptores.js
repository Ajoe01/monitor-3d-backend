import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mqtt from 'mqtt';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos
app.use(express.static('doc'));

// Conectar al broker MQTT
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883');

mqttClient.on('connect', () => {
  console.log('Conectado a MQTT');
  mqttClient.subscribe('simulink1010101', (err) => {
    if (!err) console.log('Subscrito a simulink1010101');
  });
});

// Recibir mensajes MQTT y reenviar a clientes WebSocket
mqttClient.on('message', (topic, message) => {
  console.log('[MSG]', topic, '→', message.toString());
  
  try {
    // IMPORTANTE: Parsear el mensaje JSON
    const data = JSON.parse(message.toString());
    
    // Emitir a todos los clientes conectados
    io.emit('mqttMessage', data);
    
    console.log('Datos enviados a clientes:', data);
  } catch (error) {
    console.error('Error al parsear mensaje JSON:', error);
  }
});

// Manejar conexiones WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});
// Iniciar servidor
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
