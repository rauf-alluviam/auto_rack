// 'use client'; // for app/ directory

// import { useEffect, useState } from 'react';
// import { io, Socket } from 'socket.io-client';

// export default function HomePage() {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [messages, setMessages] = useState<string[]>([]);
//   const [input, setInput] = useState('');

//   useEffect(() => {
//     const socketInstance = io('http://localhost:3000', {
//       path: '/socket.io',
//     });

//     setSocket(socketInstance);

//     socketInstance.on('server-message', (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     return () => {
//       socketInstance.disconnect();
//     };
//   }, []);

//   const sendMessage = () => {
//     if (socket && input.trim()) {
//       socket.emit('client-message', input);
//       setInput('');
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>WebSocket Chat</h2>
//       <input
//         type="text"
//         placeholder="Type a message"
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//       />
//       <button onClick={sendMessage}>Send</button>
//       <div>
//         <h4>Messages:</h4>
//         <ul>
//           {messages.map((msg, i) => (
//             <li key={i}>{msg}</li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }
