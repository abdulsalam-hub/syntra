import React from 'react'

const Nav = () => {
  return (
    <nav className="w-full font-[arial,monospace,sans-serif] flex justify-around align-center font-bold text-white backdrop-blur-md">

    
      <h1 className="text-left font-[consolas,algerian]">SyncRide</h1>
    <ul className="hidden md:block   justify-around gap-10 align-center capitalize list-none ">
        <li>Home</li>
        <li>service</li>
        <li>pricing</li>
        <li>drive</li>
        <li>contact</li>
      </ul>
      <div className=" ">
        <button className="p-2 rounded-lg backdrop:blur-md text-white bg-linear[45deg] border-none from-purple-400 to-blue-300 ">
          login
        </button>
        <button className="p-2  rounded-lg backdrop:blur-md text-white bg-blue-500">
          sign up
        </button>
      </div>
    </nav>
  );
}

export default Nav