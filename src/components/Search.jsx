import React from 'react'

const  Search = ({searchItem,setSearchItem}) => {
  return (
    <div className='search'>
        <div>
            <img src="./search.svg" alt="" />
            <input type="text" 
            placeholder='Search Movies'
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            />
        </div>
    </div>
  )
}

export default  Search