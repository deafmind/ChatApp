import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import io from 'socket.io-client';
import { FaLock, FaPaperPlane } from 'react-icons/fa';

const MonitoringContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(circle, #2a0a40 0%, var(--background-deep-purple) 70%);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 2rem;
  box-sizing: border-box;
`;

const RoomNode = styled.div`
  width: 150px;
  height: 150px;
  background-color: var(--sidebar-rich-purple);
  border: 2px solid var(--highlight-medium-purple);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--text-light-pink);
  box-shadow: 0 0 20px var(--accent-soft-pink);
  z-index: 10;
`;

const Packet = styled(motion.div)`
  position: absolute;
  padding: 0.5rem 1rem;
  background: var(--accent-soft-pink);
  color: var(--background-deep-purple);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  z-index: 20;
  white-space: nowrap;
`;

// A mock list of rooms for positioning
const MOCK_ROOMS = [
    { id: 1, name: 'General', pos: { top: '20%', left: '15%' } },
    { id: 2, name: 'Frontend', pos: { top: '50%', left: '75%' } },
    { id: 3, name: 'Backend', pos: { top: '70%', left: '25%' } },
];

const MonitoringPage = () => {
    const [packets, setPackets] = useState([]);
    const socketRef = useRef();

    useEffect(() => {
        // This should connect to a dedicated monitoring WebSocket endpoint on your backend
        socketRef.current = io('ws://127.0.0.1:8000/ws/monitoring/');

        socketRef.current.on('new_encrypted_message', (data) => {
            // data should contain { from_room_id, to_room_id, encrypted_text, id }
            const fromRoom = MOCK_ROOMS.find(r => r.id === data.from_room_id);
            const toRoom = MOCK_ROOMS.find(r => r.id === data.to_room_id);

            if (fromRoom && toRoom) {
                setPackets(prev => [...prev, { ...data, fromPos: fromRoom.pos, toPos: toRoom.pos }]);
            }
        });

        // Cleanup on unmount
        return () => socketRef.current.disconnect();
    }, []);
    
    // Simulate a message for demonstration
    useEffect(() => {
        const interval = setInterval(() => {
             const fromRoom = MOCK_ROOMS[Math.floor(Math.random()*MOCK_ROOMS.length)];
             let toRoom = MOCK_ROOMS[Math.floor(Math.random()*MOCK_ROOMS.length)];
             while(fromRoom.id === toRoom.id) {
                toRoom = MOCK_ROOMS[Math.floor(Math.random()*MOCK_ROOMS.length)];
             }

             const mockData = {
                id: Date.now(),
                from_room_id: fromRoom.id,
                to_room_id: toRoom.id,
                encrypted_text: 'gAAAAAB' + Math.random().toString(36).substring(2, 15),
                fromPos: fromRoom.pos,
                toPos: toRoom.pos,
             }
             setPackets(prev => [...prev, mockData]);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <MonitoringContainer>
            {MOCK_ROOMS.map(room => (
                <RoomNode key={room.id} style={room.pos}>
                    <h3>{room.name}</h3>
                    <FaPaperPlane size={24} />
                </RoomNode>
            ))}

            {packets.map(packet => (
                <Packet
                    key={packet.id}
                    initial={{
                        ...packet.fromPos,
                        opacity: 0,
                        scale: 0.5,
                    }}
                    animate={{
                        ...packet.toPos,
                        opacity: [0, 1, 1, 0],
                        scale: [0.5, 1, 1, 0.5],
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    onAnimationComplete={() => {
                        setPackets(prev => prev.filter(p => p.id !== packet.id));
                    }}
                >
                    <FaLock />
                    {packet.encrypted_text.substring(0, 20)}...
                </Packet>
            ))}
        </MonitoringContainer>
    );
};

export default MonitoringPage;