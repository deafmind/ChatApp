// A simplified ChatWindow.jsx to illustrate the point
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import styled from 'styled-components';
// ... import icons and other components

const ChatWindowContainer = styled.div`
  /* styles for the chat window */
`;
// ... more styled components for messages, input bar etc.

const ChatWindow = () => {
    const { slug } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef();

    useEffect(() => {
        // Fetch initial messages
        const fetchMessages = async () => {
            const response = await apiClient.get(`/chat/rooms/${slug}/messages/`);
            setMessages(response.data.results.reverse());
        };
        fetchMessages();

        // Connect to WebSocket
        // NOTE: Your backend needs a WebSocket server (e.g., Django Channels)
        socketRef.current = io('ws://127.0.0.1:8000/ws/chat/' + slug + '/');

        socketRef.current.on('connect', () => {
            console.log('WebSocket connected!');
        });

        socketRef.current.on('new_message', (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        return () => {
            socketRef.current.disconnect();
        };

    }, [slug]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        
        const messageData = {
            content: newMessage,
            // The backend will get the user from the authenticated connection
        };

        // Send message via WebSocket
        socketRef.current.emit('send_message', messageData);

        // Or send via API and let WebSocket broadcast it
        // apiClient.post(`/chat/rooms/${slug}/messages/`, { content: newMessage });
        
        setNewMessage('');
    };

    return (
        <ChatWindowContainer>
            <div className="message-list">
                {messages.map(msg => (
                    <div key={msg.id} className={msg.user.id === user.id ? 'my-message' : 'other-message'}>
                        <strong>{msg.user.username}</strong>
                        <p>{msg.content}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
        </ChatWindowContainer>
    );
};

export default ChatWindow;