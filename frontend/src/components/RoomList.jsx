import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { FaPlusCircle } from 'react-icons/fa';

const SidebarContainer = styled.aside`
  background-color: var(--sidebar-rich-purple);
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid var(--background-deep-purple);
`;

const Header = styled.header`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--background-deep-purple);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-light-pink);
  }
`;

const CreateRoomButton = styled.button`
    background: none;
    border: none;
    color: var(--accent-soft-pink);
    font-size: 1.5rem;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color 0.2s ease-in-out;

    &:hover {
        color: var(--text-light-pink);
    }
`;

const RoomListWrapper = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
`;

const RoomItem = styled.li`
  padding: 1rem 1.5rem;
  cursor: pointer;
  border-bottom: 1px solid var(--background-deep-purple);
  transition: background-color 0.2s ease-in-out;
  background-color: ${props => props.isActive ? 'var(--highlight-medium-purple)' : 'transparent'};
  
  &:hover {
    background-color: var(--highlight-medium-purple);
  }

  h3 {
    margin: 0 0 0.25rem 0;
    color: var(--text-light-pink);
    font-size: 1.1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--accent-soft-pink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const LoadingContainer = styled.div`
    text-align: center;
    padding-top: 2rem;
    color: var(--accent-soft-pink);
`;

const NoRoomsMessage = styled.div`
    text-align: center;
    padding: 2rem;
    color: var(--accent-soft-pink);
`;


const RoomList = ({ rooms, onRoomSelect, loading }) => {
  const { slug } = useParams(); // Get the current room slug from the URL

  const handleCreateRoom = () => {
    // In a real app, this would open a modal form
    alert("Functionality to create a new room can be added here!");
  };

  if (loading) {
    return (
        <SidebarContainer>
            <Header><h2>Rooms</h2></Header>
            <LoadingContainer>Loading chats...</LoadingContainer>
        </SidebarContainer>
    );
  }

  return (
    <SidebarContainer>
        <Header>
            <h2>Chats</h2>
            <CreateRoomButton onClick={handleCreateRoom} title="Create new room">
                <FaPlusCircle />
            </CreateRoomButton>
        </Header>
        <RoomListWrapper>
            {rooms.length > 0 ? (
                rooms.map(room => (
                    <RoomItem
                        key={room.id}
                        onClick={() => onRoomSelect(room.slug)}
                        isActive={slug === room.slug}
                    >
                        <h3>{room.name}</h3>
                        <p>{room.description || 'No description'}</p>
                    </RoomItem>
                ))
            ) : (
                <NoRoomsMessage>
                    No rooms found. Why not create one?
                </NoRoomsMessage>
            )}
        </RoomListWrapper>
    </SidebarContainer>
  );
};

export default RoomList;
