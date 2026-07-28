
import {NavLink} from "react-router-dom";


const MobileNav=(nav,setNav) =>
{

    
    const NavDirect = ({
      isActive
    }) =>
      isActive
        ? " border-b border-blue-500 font-bolder transition-view "
        : " nth-[1]:border-none border-t border-slate-400  p-2 text-white capitalize"; 
  return (
    <nav className="w-full font-[arial,monospace,sans-serif]  flex justify-around align-center font-bold text-white backdrop-blur-md">
      {nav && (
        <div
          onClick={() => {
            setNav((prev) => !prev);
          }}
          title="menu"
          className="p-3 text-xl rounded bg-linear-to-tl from-purple-500 to-blue-500 text-white "
        >
          ⇛
        </div>
      )}

      <h1 className="text-left font-[consolas,algerian]">SyncRide</h1>
      {nav && (
        <div className="flex flex-col bg-[rgba(0,0,0,0.3)] backdrop:blur-md shadow-blue-400 shadow-md rounded-md relative top-10 left-0 z-50  justify-around gap-10 align-center capitalize list-none  ">
          <NavLink className={NavDirect}>Home</NavLink>
          <NavLink className={NavDirect}>pricing</NavLink>
          <NavLink className={NavDirect}>drive</NavLink>
          <NavLink className={NavDirect}>contact</NavLink>
        </div>
      )}
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

export default MobileNav
