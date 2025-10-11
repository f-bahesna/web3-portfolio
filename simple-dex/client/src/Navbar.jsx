import React, { useState } from 'react';


const Navbar = () => {
    const [nav, setNav] = useState(false);

    const handleNav = () => {
        setNav(!nav)
    }

    const navItems = [
        { id: 1, text: 'Faucet'},
        { id: 2, text: 'Token'}
    ];

    return (
        <div className='bg-black rounded-lg flex justify-between items-center h-24 max-w-[1240px] mx-auto px-4 text-white'>
            <h1 className='w-full text-1xl font-bold text-[#00df9a]'>SimpleDEX</h1>
            <ul className='hidden md:flex'>
                {navItems.map(item => (
                    <li key={item.id} className='p-4 hover:bg-[#00df9a] rounded-xl m-2 cursor-pointer duration-300 hover:text-black'>
                        {item.text}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Navbar;