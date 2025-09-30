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
  Button,
  CircularProgress
} from '@mui/material';
import api from '../services/api';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/chat/api/rooms/');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Chat Rooms
        </Typography>
        <Button variant="contained" component={Link} to="/rooms/create">
          Create Room
        </Button>
      </Box>

      <Paper elevation={2}>
        <List>
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <ListItem key={room.id} disablePadding>
                <ListItemButton component={Link} to={`/rooms/${room.slug}`}>
                  <ListItemText
                    primary={room.name}
                    secondary={
                      `Members: ${room.member_count} | ${room.is_private ? 'Private' : 'Public'} | Created by: ${room.created_by}`
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No rooms found" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default RoomList;