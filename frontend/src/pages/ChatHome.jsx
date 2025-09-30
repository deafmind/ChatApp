import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton,
  Paper,
  Box,
  Button
} from '@mui/material';
import api from '../services/api';

const ChatHome = () => {
  const [recentRooms, setRecentRooms] = useState([]);

  useEffect(() => {
    fetchRecentRooms();
  }, []);

  const fetchRecentRooms = async () => {
    try {
      const response = await api.get('/chat/api/rooms/');
      setRecentRooms(response.data.slice(0, 10)); // Get first 10 rooms
    } catch (error) {
      console.error('Error fetching recent rooms:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to Chat App
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          component={Link} 
          to="/rooms"
          sx={{ mr: 2 }}
        >
          Browse All Rooms
        </Button>
        <Button 
          variant="outlined" 
          component={Link} 
          to="/rooms/create"
        >
          Create New Room
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Recent Rooms
      </Typography>
      
      <Paper elevation={2}>
        <List>
          {recentRooms.length > 0 ? (
            recentRooms.map((room) => (
              <ListItem key={room.id} disablePadding>
                <ListItemButton component={Link} to={`/rooms/${room.slug}`}>
                  <ListItemText
                    primary={room.name}
                    secondary={`Members: ${room.member_count} | Created by: ${room.created_by}`}
                  />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No recent rooms found" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default ChatHome;