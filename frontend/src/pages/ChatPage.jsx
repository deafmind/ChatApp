import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import RoomList from '../components/RoomList';
import ChatWindow from '../components/ChatWindow';
import apiClient from '../api/axiosConfig';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';

const ChatLayout = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

const WelcomeMessage = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: var(--accent-soft-pink);
    font-size: 1.5rem;
    background-color: var(--background-deep-purple);
`;

const ChatPage = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await apiClient.get('/chat/rooms/');
                setRooms(response.data.results);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch rooms", error);
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    const handleRoomSelect = (slug) => {
        navigate(`/chat/${slug}`);
    };

    return (
        <ChatLayout>
            <RoomList rooms={rooms} onRoomSelect={handleRoomSelect} loading={loading} />
            <Routes>
                 <Route path=":slug" element={<ChatWindow />} />
                 <Route index element={<WelcomeMessage>Select a room to start chatting</WelcomeMessage>} />
            </Routes>
        </ChatLayout>
    );
};

export default ChatPage;