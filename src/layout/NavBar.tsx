import React, {useState} from 'react'
import Nav from "../component/Nav";

import MobileNav from '../component/MobileNav';
const NavBar=() =>
{
    const [nav,setNav]=useState(false)
  return (
      <div>
          <Nav  nav={nav} setNav={setNav}/>
          <MobileNav nav={nav} setNav={setNav}/>
    </div>
  )
};export default NavBar