import { Locate, LocateFixed } from 'lucide-react'
import React, { useState } from 'react'

function UserSearch({searchKey, setSearchKey}) {

  return (
    <div className='relative'>
        <input type="text"
        placeholder='Search users / chat'
        className='rounded-full pl-10 w-full border-gray-300 text-gray-600'
        value={searchKey}
        onChange={(e) => setSearchKey(e.target.value)} />
        <LocateFixed  className='absolute left-3 top-[0.55rem] text-gray-400'/>
    </div>
  )
}

export default UserSearch