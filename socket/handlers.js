const chatService = require('../services/session.service');

module.exports = (io, socket) => {
  socket.on('join_session', ({ sessionId }) => socket.join(sessionId));
  socket.on('student_message', async (msg) => {
    const response = await chatService.handleStudentMessage(msg);
    io.to(msg.sessionId).emit(response.type, response);
  });
};
