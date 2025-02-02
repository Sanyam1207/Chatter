import { CheckCheck, Link2, Send, SmilePlus } from 'lucide-react'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { clearChatMessages } from '../../../apicalls/chats'
import { GetMessages, sendMessage } from '../../../apicalls/messages'
import { hideLoader, showLoader } from '../../../redux/loaderSlice'
import store from '../../../redux/store'
import { setAllChats } from '../../../redux/userSlice'
import EmojiPicker from 'emoji-picker-react'

const ChatArea = ({ socket }) => {

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [recipientTyping, setRecipientTyping] = useState(false)
  const chatAreaRef = useRef()
  const dispatch = useDispatch()
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState([])
  const { selectedChat, user, allChats } = useSelector(state => state.userReducer)
  const recipientUser = selectedChat.members.find((mem) => mem._id !== user._id)


  const getMessages = async () => {

    try {
      dispatch(showLoader())
      const response = await GetMessages(selectedChat._id)
      if (response.success) {
        setMessages(response.data)
      }
      dispatch(hideLoader())
    } catch (error) {
      dispatch(hideLoader())
      toast.error(error.message)
    }
  }

  const clearUnreadMessages = async () => {

    try {

      socket.emit('clear-unread-messages', {
        chat: selectedChat._id,
        members: selectedChat.members.map((mem) => mem._id),
      })

      const response = await clearChatMessages(selectedChat._id)

      console.log(response);

      if (response.success) {
        const updatedChats = allChats.map((chat) => {
          if (chat._id === selectedChat._id) {
            return response.data
          }
          return chat
        })

        dispatch(setAllChats(updatedChats))
      }

    } catch (error) {

      toast.error(error.message)
    }
  }

  useEffect(() => {
    getMessages()
    if (selectedChat?.lastMessage?.sender !== user._id) {
      clearUnreadMessages()
    }

    socket.off('recieve-message').on('recieve-message', (message) => {
      const tempSelectedChat = store.getState().userReducer.selectedChat
      if (tempSelectedChat._id === message.chat) {
        setMessages((prev) => [...prev, message])
      }

      if (tempSelectedChat._id === message.chat && message.sender !== user._id) {
        clearUnreadMessages()
      }
    })

    // clear unread messages
    socket.on('unread-messages-cleared', (data) => {
      const tempAllChats = store.getState().userReducer.allChats
      const tempSelectedChat = store.getState().userReducer.selectedChat

      if (data.chat === tempSelectedChat._id) {
        const updatedChats = tempAllChats.map((chat) => {
          if (chat._id === data.chat) {
            return {
              ...chat,
              unreadMessages: 0
            }
          }
          return chat
        })
        dispatch(setAllChats(updatedChats))

        setMessages((prev) => {
          return prev.map((message) => {
            return {
              ...message,
              read: true
            }
          })
        })
      }
    })

    socket.on('started-typing', (data) => {
      const selectedChat = store.getState().userReducer.selectedChat
      if (data.chat === selectedChat._id && data.sender !== user._id) {

        setRecipientTyping(true)


        if (chatAreaRef.current) {
          // Scroll smoothly to the bottom
          chatAreaRef.current.scrollTo({
            top: chatAreaRef.current.scrollHeight - 100,
            behavior: 'smooth',
          });
        }


        setTimeout(() => {
          setRecipientTyping(false)
        }, 2000);

      }
    })
    // eslint-disable-next-line
  }, [selectedChat])

  useEffect(() => {
    if (chatAreaRef.current) {
      // Scroll smoothly to the bottom
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight - 100,
        behavior: 'smooth',
      });
    }
  }, [messages]);


  const sendNewMessage = async (image) => {
    try {   

      //building the payload 
      const message = {
        chat: selectedChat._id,
        sender: user._id,
        text: newMessage,
        image
      }

      //send message to server using socket
      socket.emit('send-message', {
        ...message,
        members: selectedChat.members.map((mem) => mem._id),
        createdAt: moment(),
        read: false
      })


      const response = await sendMessage(message)

      console.log(response);

      if (response.success) {
        setNewMessage("")
      }
    } catch (error) {

      toast.error(error.message)
    }
  }

  const handleSendMessageOnEnter = (e) => {
    if (e.key === 'Enter') {
      sendNewMessage()
    }
  }

  const getDateInRegularFormat = (date) => {
    let result = ""

    //if date is today then return today
    if (moment(date).isSame(moment(), 'day')) {
      result = 'Today'
    }

    //if date is yesterday then return yesterday
    else if (moment(date).isSame(moment().subtract(1, 'day'), 'day')) {
      result = 'Yesterday'
    }

    else if (moment(date).isSame(moment(), 'year')) {
      result = moment(date).format('MMM DD')
    }

    else {
      result = moment(date).format('MMM DD, YYYY')
    }

    return result
  }

  const onUploadImageClick = async (e) => {
    const file = e.target.files[0]
    const reader = new FileReader(file)
    reader.readAsDataURL(file)
    reader.onloadend = async () => {
      sendNewMessage(reader.result)
    }
    console.log(file)
  }

  return (
    <div className='bg-white h-[80vh] border rounded-2xl w-full flex flex-col justify-between p-2'>

      {/* recipient user */}
      <div className=''>
        <div className='flex items-center gap-3 m-3'>
          {
            // eslint-disable-next-line
            recipientUser.profilePicture && (<img src={recipientUser.profilePicture} className='h-14 w-auto rounded-full' alt='Profile Picture' />)
          }
          {
            !recipientUser.profilePicture && (
              <div className='flex items-center justify-center h-10 w-10 rounded-full bg-slate-900'>
                <h1 className='uppercase text-2xl font-semibold text-stone-200'>
                  {recipientUser?.name[0]}
                </h1>
              </div>
            )
          }
          <h1 className='uppercase'>{recipientUser.name}</h1>
        </div>
        <hr />
      </div>

      {/* Chat Messages */}
      <div ref={chatAreaRef} className='h-[60vh] overflow-y-scroll scrollbar2 pr-1'>
        <div className='flex flex-col gap-3'>
          {
            messages.map((message, index) => {
              const currentUserIsSender = message.sender === user._id
              console.log(messages[index - 1]);

              return <div>
                <h1 className='text-center'>
                  {
                    messages[index - 1] &&
                    moment(messages[index - 1].createdAt).format('DD MM YYYY')
                    !== moment(messages[index].createdAt).format('DD MM YYYY')
                    && getDateInRegularFormat(message.createdAt)
                  }
                </h1>
                <div className={`flex ${currentUserIsSender && 'justify-end'}`}>
                  <div className={` max-w-[50%] flex flex-col ${currentUserIsSender ? 'bg-primary text-secondary rounded-s-2xl' : 'bg-secondary text-primary rounded-e-2xl'} px-4 pt-4 pb-2`}>
                    {message.text !== "" && <h1 className='text-base mb-3'>
                      {message.text}
                    </h1>}
                    
                    {
                    // eslint-disable-next-line
                    message.image && <img src={message.image} className='w-44 h-auto object-cover' alt='Image' />}
                    <hr />
                    <h3 className='text-xs mt-2'>
                      {moment(message.createdAt).format('hh:mm A')}
                      {currentUserIsSender && <CheckCheck className={`${message.read ? 'text-secondary font-extrabold text-2xl' : 'text-secondary opacity-20'} text-xs w-4`} />}
                    </h3>
                  </div>

                </div>
              </div>

            })
          }
          {recipientTyping && (

            <h1 className='bg-secondary p-3 transition-all ease-in-out animate-pulse w-56 text-primary rounded-tr-none rounded-xl'>
              Typing....
            </h1>

          )}
        </div>
      </div>


      {/* Chat Input */}
      <div className='h-14 rounded-xl items-center border-primary border-opacity-75 transition-all ease-in-out shadow justify-between flex p-2 relative'>
        {showEmojiPicker && <div className='absolute bottom-16'>
          <EmojiPicker height={'25rem'} onEmojiClick={(e) => {
            setNewMessage((prev) => prev + e.emoji)
          }} />
        </div>}
        <label htmlFor='file'>
          <Link2 className='mr-2 hover:scale-110 transition-all ease-in-out cursor-pointer' />
          <input type="file" className='hidden' name="file" id="file" accept='image/gif, image/jpeg, image/png, image/jpg' onChange={onUploadImageClick} />
        </label>

        <SmilePlus className='cursor-pointer hover:scale-110 transition-all ease-in-out' onClick={() => setShowEmojiPicker(prev => !prev)} />
        <input type="text" onFocus={() => {
          if (showEmojiPicker) setShowEmojiPicker(false)
        }} placeholder='message' className='w-[90%] h-full border-0 rounded-xl focus:border-none' value={newMessage} onKeyDown={(e) => handleSendMessageOnEnter(e)}
          onChange={(e) => {
            setNewMessage(e.target.value)
            socket.emit('typing', {
              chat: selectedChat._id,
              members: selectedChat.members.map((mem) => mem._id),
              sender: user._id,
            })

          }} />
        <button onClick={() => sendNewMessage("")} className='bg-primary text-white hover:bg-secondary transition-all ease-in-out rounded-lg p-3 flex justify-center items-center'>
          <Send className='h-5 w-9 hover:text-primary transition-all ease-in-out' />
        </button>
      </div>

    </div>
  )
}

export default ChatArea