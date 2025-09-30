import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Typography, 
  Box,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import api from '../services/api';

const RoomDetail = () => {
  const { slug } = useParams();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomDetails();
    fetchMessages();
  }, [slug]);

  const fetchRoomDetails = async () => {
    try {
      const response = await api.get(`/chat/api/rooms/${slug}/`);
      setRoom(response.data);
    } catch (error) {
      console.error('Error fetching room details:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/api/rooms/${slug}/messages/`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      await api.post(`/chat/api/rooms/${slug}/messages/`, {
        content: newMessage
      });
      setNewMessage('');
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!room) {
    return <Typography>Room not found</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {room.name}
      </Typography>
      
      <Paper elevation={2} sx={{ p: 2, mb: 2, height: '400px', overflow: 'auto' }}>
        <List>
          {messages.map((message) => (
            <ListItem key={message.id}>
              <ListItemText
                primary={message.content}
                secondary={`By: ${message.sender} | ${new Date(message.timestamp).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button variant="contained" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default RoomDetail;