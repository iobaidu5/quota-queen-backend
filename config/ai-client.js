// const { connect } = require('livekit-client');
// const { nonstandard: { RTCVideoSource, RTCAudioSource } } = require('@koush/wrtc');

// function createBlackI420Frame(width, height) {
//   const yLen = width * height;
//   const uvLen = (width / 2) * (height / 2);
//   const yPlane = Buffer.alloc(yLen, 0);
//   const uPlane = Buffer.alloc(uvLen, 128);
//   const vPlane = Buffer.alloc(uvLen, 128);
//   return Buffer.concat([yPlane, uPlane, vPlane]);
// }

// async function startAIParticipant({ roomUrl, token }) {
//   const room = await connect(roomUrl, token, {});

//   const videoSource = new RTCVideoSource();
//   const videoTrack = videoSource.createTrack();

//   setInterval(() => {
//     const frame = createBlackI420Frame(640, 480);
//     videoSource.onFrame({
//       data: frame,
//       width: 640,
//       height: 480,
//     });
//   }, 1000 / 30);

//   const audioSource = new RTCAudioSource();
//   const audioTrack = audioSource.createTrack();

//   setInterval(() => {
//     audioSource.onData({
//       samples: new Int16Array(480),
//       sampleRate: 48000,
//       bitsPerSample: 16,
//       channelCount: 1,
//     });
//   }, 10);

//   await room.localParticipant.publishTrack(videoTrack);
//   await room.localParticipant.publishTrack(audioTrack);

//   console.log("AI participant connected and tracks published.");
// }

// startAIParticipant({
//   roomUrl: process.env.LIVEKIT_URL,   
//   token: process.env.AI_PARTICIPANT_TOKEN
// }).catch(console.error);



const { connect } = require('livekit-client');
const { nonstandard: { RTCVideoSource, RTCAudioSource } } = require('@koush/wrtc');

function createBlackI420Frame(width, height) {
  const yLen = width * height;
  const uvLen = (width / 2) * (height / 2);
  const yPlane = Buffer.alloc(yLen, 0);
  const uPlane = Buffer.alloc(uvLen, 128);
  const vPlane = Buffer.alloc(uvLen, 128);
  return Buffer.concat([yPlane, uPlane, vPlane]);
}

async function startAIParticipant({ roomUrl, token }) {
  const room = await connect(roomUrl, token, {});

  room.localParticipant.setMetadata(JSON.stringify({
    name: "AI Assistant",
    title: "Virtual Agent",
    designation: "AI Support",
    avatarUrl: "https://example.com/ai-avatar.jpg",
    isAI: true
  }));

  const videoSource = new RTCVideoSource();
  const videoTrack = videoSource.createTrack();

  setInterval(() => {
    const frame = createBlackI420Frame(640, 480);
    videoSource.onFrame({
      data: frame,
      width: 640,
      height: 480,
    });
  }, 1000 / 30);

  const audioSource = new RTCAudioSource();
  const audioTrack = audioSource.createTrack();

  setInterval(() => {
    audioSource.onData({
      samples: new Int16Array(480),
      sampleRate: 48000,
      bitsPerSample: 16,
      channelCount: 1,
    });
  }, 10);

  await room.localParticipant.publishTrack(videoTrack);
  await room.localParticipant.publishTrack(audioTrack);

  console.log("AI participant connected with metadata");
}

startAIParticipant({
  roomUrl: process.env.LIVEKIT_URL,   
  token: process.env.AI_PARTICIPANT_TOKEN
}).catch(console.error);