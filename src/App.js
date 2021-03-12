import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import AgoraRTC from 'agora-rtc-sdk-ng';

const rtc = {
  client: null,
  localAudioTrack: null,
  localVideoTrack: null,
};

const options = {
  appId: '3c959e7eb4864d75b2539f38e289f6e6',
  channel: 'demo_channel_name',
  token: null,
};

const client = AgoraRTC.createClient({
  codec: 'vp8',
  mode: 'rtc',
});

async function leaveCall() {
  rtc.localAudioTrack.close();
  rtc.localVideoTrack.close();

  rtc.client.remoteUsers.forEach((user) => {
    const playerContainer = document.getElementById(user.uid);
    playerContainer && playerContainer.remove();
  });
  await rtc.client.leave();
  window.location = '/';
}

function App() {
  useEffect(async () => {
    rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'h264' });
    const uid = await rtc.client.join(
      options.appId,
      'test',
      options.token,
      null
    );
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);

    rtc.localVideoTrack.play('local-stream');

    rtc.client.on('user-published', async (user, mediaType) => {
      await rtc.client.subscribe(user);
      console.log('subscribe success');

      if (mediaType === 'video' || mediaType === 'all') {
        const remoteVideoTrack = user.videoTrack;
        const PlayerContainer = React.createElement('div', {
          id: user.uid,
          className: 'stream',
        });
        ReactDOM.render(
          PlayerContainer,
          document.getElementById('remote-stream')
        );
        remoteVideoTrack.play(`${user.uid}`);
      }

      if (mediaType === 'audio' || mediaType === 'all') {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
      }

      rtc.client.on('user-unpublished', (user) => {
        const playerContainer = document.getElementById(user.uid);
        playerContainer.remove();
      });
    });

    console.log('publish success!');
  }, []);

  return (
    <div className='container'>
      <div id='local-stream' className='stream local-stream'></div>
      <div id='remote-stream' className='stream remote-stream'></div>
    </div>
  );
}

export default App;
