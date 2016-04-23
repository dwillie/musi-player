const mqtt       = require('mqtt');
const mqttClient = mqtt.connect('mqtt://0.0.0.0');
const exec       = require('child_process').exec;
const fs         = require('fs');

mqttClient.on('connect', () => {
  mqttClient.subscribe('sync/#');
  mqttClient.subscribe('play/#');
});

mqttClient.on('message', (topic, message) => {
  const messageObj = JSON.parse(message);
  if (topic.slice(0, 'sync'.length) === 'sync') {
    syncMp3(messageObj.id, messageObj.url).then(() => {
      mqttClient.publish('readyAck', { id: messageObj.id, ready: true });
    }).catch((err) => {
      console.error(err);
      mqttClient.publish('readyAck', { id: messageObj.id, ready: false, err });
    });
  } else {

  }
});

const syncMp3 = (id, url) => {
  return new Promise((resolve, reject) => {
    fs.exists(`./files/${videoId}.mp3`, (exists) => {
      if (!exists) {
        downloadToCache(url)
        .then(() => { resolve(); })
        .catch((err) => { reject(err); });
      }
    });
  });
};

const downloadToCache = (id, url) => {
  return new Promise((resolve, reject) => {
    exec(`wget -O './files/${id}.mp3' ${url}`,
      (err) => {
        if (err !== null) { reject(err); }
        else { resolve(); }
    });
  });
};
