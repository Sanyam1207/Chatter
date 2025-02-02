import React, { useEffect, useState } from 'react';
import UserSearch from './components/UserSearch';
import ChatArea from './components/ChatArea';
import UsersList from './components/UsersList';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { Menu } from 'lucide-react';

const socket = io('http://localhost:5000');
localStorage.setItem('socket', socket);

const Home = () => {
  const [searchKey, setSearchKey] = useState('');
  const [showUsersList, setShowUsersList] = useState(false);
  const { selectedChat, user } = useSelector(state => state.userReducer);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user) {
      socket.emit('join-room', { user: user._id });
      socket.emit('came-online', { user: user._id });
      socket.on('online-users', (data) => {
        setOnlineUsers(data);
      });
    }
  }, [user]);

  // Hide users list when chat is selected on mobile
  useEffect(() => {
    if (selectedChat && window.innerWidth < 768) {
      setShowUsersList(false);
    }
  }, [selectedChat]);

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={() => setShowUsersList(!showUsersList)}
        className='md:hidden fixed top-9 left-4 z-50'
      >
        <Menu size={24} />
      </button>

      <div className='flex gap-6'>
        {/* Users section */}
        <div className={`w-96 ${showUsersList ? 'block md:block' : 'hidden md:block'} p-2 md:p-0`}>
          <UserSearch searchKey={searchKey} setSearchKey={setSearchKey} />
          <UsersList searchKey={searchKey} socket={socket} onlineUsers={onlineUsers}/>
        </div>

        {/* Chat section */}
        <div className={`w-full ${showUsersList ? 'hidden md:block' : 'block'}`}>
          {selectedChat && <ChatArea socket={socket} />}
        </div>
      </div>
    </>
  );
};

export default Home;