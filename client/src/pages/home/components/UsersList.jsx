import moment from 'moment'
import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { CreateNewChat } from '../../../apicalls/chats'
import { hideLoader, showLoader } from '../../../redux/loaderSlice'
import store from '../../../redux/store'
import { setAllChats, setSelectedChat } from '../../../redux/userSlice'

const UsersList = ({ searchKey, socket, onlineUsers }) => {

  const { allUsers, allChats, user, selectedChat } = useSelector(state => state.userReducer)
  const dispatch = useDispatch()

  const createNewChat = async (recipentUserId) => {
    console.log("Create new Chat triggered");


    try {
      dispatch(showLoader())
      const response = await CreateNewChat([user._id, recipentUserId])
      dispatch(hideLoader())
      if (response.success) {
        toast.success(response.message)
        const newChat = response.data
        console.log(newChat);
        
        const updatedChat = [...allChats, newChat]
        dispatch(setAllChats(updatedChat))
        dispatch(setSelectedChat(newChat))
      }
    } catch (error) {
      dispatch(hideLoader())
      toast.error(error.message)
    }
  }

  const openChat = async (recipentUserId) => {
    const chat = allChats.find((chat) => chat.members.map((mem) => mem._id).includes(user._id) && chat.members.map((mem) => mem._id).includes(recipentUserId))
    if (chat) {
      dispatch(setSelectedChat(chat))
    }
  }

  const getData = () => {
    // if search key is empty return all chats else return users and chats based on search key
    if (searchKey === "") {
      return allChats;
    }

    return allUsers.filter((user) => user.name.toLowerCase().includes(searchKey.toLowerCase()))
  }

  const getIsSelectedChat = (userObj) => {
    if (selectedChat) {
      return selectedChat.members.map((mem) => mem._id).includes(userObj._id)
    }
    return false
  }

  const getLastMessage = (userObj) => {
    const chat = allChats.find((chat) => chat.members.map((mem) => mem._id).includes(userObj._id))
    if (!chat || !chat.lastMessage) {
      return ''
    } else {
      const lastMessagePerson = chat?.lastMessage?.sender === user._id ? "You : " : "";
      const maxWords = 5; // Set max number of words

      const messageText = chat?.lastMessage?.text || "";
      const words = messageText.split(" ");
      const truncatedText = words.length > maxWords
        ? words.slice(0, maxWords).join(" ") + "..."
        : messageText;

      return (
        <div className="flex gap-0 justify-between w-full">
          <h1 className="text-sm text-slate-700">
            {lastMessagePerson} {truncatedText}
          </h1>
          <h1 className="text-sm text-gray-500">
            <small>{moment(chat?.lastMessage?.createdAt).format("hh:mm A")}</small>
          </h1>
        </div>
      );
    }
  }

  const getUnreadMessages = (userObj) => {
    const chat = allChats.find((chat) => chat.members.map((mem) => mem._id).includes(userObj._id))

    if (chat && chat?.unreadMessages && chat?.lastMessage?.sender !== user._id) {
      return (
        <div className='bg-blue-400 rounded-full w-4 h-4 text-xs p-3 flex items-center justify-center text-white'>
          {chat.unreadMessages}
        </div>
      )
    }
  }


  useEffect(() => {
    socket.on('recieve-message', (message) => {
      const tempSelectedChat = store.getState().userReducer.selectedChat
      let tempAllChats = store.getState().userReducer.allChats 
    
      const updatedAllChats = tempAllChats.map((chat) => {
        if (chat._id === message.chat) {
          return {
            ...chat,
            lastMessage: message,
            unreadMessages: tempSelectedChat?._id !== message.chat 
              ? (chat.unreadMessages || 0) + 1 
              : 0 // if the chat is open, you may want to keep it 0 or update as appropriate
          }
        }
        return chat
      })
    
      const latestChat = updatedAllChats.find((chat) => chat._id === message.chat)
      const otherChats = updatedAllChats.filter((chat) => chat._id !== message.chat)
      const newAllChats = [latestChat, ...otherChats]
    
      dispatch(setAllChats(newAllChats))
    })
    // eslint-disable-next-line
  }, [])

  return (
    <div className='flex flex-col mt-5 gap-2 w-96 pr-4 md:pr-0'>
      {
        getData().map((chatObjOrUserObj) => {

          let userObj = chatObjOrUserObj;
          if (chatObjOrUserObj.members) {
            userObj = chatObjOrUserObj.members.find((mem) => mem._id !== user._id)
          }

          return (
            <div className={`shadow-md rounded-3xl border p-5 flex justify-between cursor-pointer hover:bg-slate-100 transition-all ${getIsSelectedChat(userObj) && 'border-primary border-2'}`}
              key={userObj._id}
              onClick={() => openChat(userObj._id)}
            >
              <div className='flex items-center gap-5 w-full'>
                {
                  // eslint-disable-next-line
                  userObj.profilePicture && (<img src={userObj.profilePicture} className={`h-14 w-auto rounded-full  ${onlineUsers.includes(userObj._id) ? "border-green-800 border-4" : 'border-4 border-gray-600'}`} alt='Profile Picture' />)
                }
                {
                  !userObj.profilePicture && (
                    <div className={`flex items-center justify-center h-10 w-12 rounded-full bg-slate-900 
                    ${onlineUsers.includes(userObj._id) ? "border-green-800 border-4" : 'border-4 border-gray-600'}`}>
                      <h1 className='uppercase text-2xl font-semibold text-stone-200'>
                        {userObj.name[0]}
                      </h1>
                      
                    </div>
                  )
                }
                <div className='flex flex-col gap-1 w-full'>
                  <div className='flex gap-1 justify-between'>
                    <h1 className='text-lg'>
                      {userObj.name}
                    </h1>
                    {getUnreadMessages(userObj)}
                  </div>

                  {getLastMessage(userObj)}
                </div>
              </div>
              <div onClick={() => { createNewChat(userObj._id) }}>
                {!allChats.find((chat) => chat.members.map((mem) => mem._id).includes(userObj._id)) && (

                  <button className='border-primary border text-xs hover:text-secondary hover:bg-primary transition-all opacity-90 text-primary bg-secondary px-3 py-2 rounded-2xl'>
                    Create Chat
                  </button>

                )}
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

export default UsersList