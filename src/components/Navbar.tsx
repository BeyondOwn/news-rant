'use client'
import { useAuth } from '@/context/context';
import axios from "axios";
import {
  CircleUserRound,
  LogIn,
  LogOut,
  MenuIcon,
  Moon,
  UserCog
} from "lucide-react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useRef, useState } from 'react';
import { Separator } from './ui/separator';



type NavbarProps = object



const Navbar: FC<NavbarProps> = ({}) => {
  const router = useRouter();
  const {user} = useAuth();
  //drop menu
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

   const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClickOutside = (event:MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

    // Add and clean up event listener for clicks outside
    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

     // Close the menu when an item is clicked
    

    const logout = async () => {
        try {
          const response = await axios.get("http://localhost:5000/logout", {
            withCredentials: true, // Ensure cookies are included in the request
          });
      
          if (response.status === 200) {
            // Logout was successful
            console.log("Logged out successfully.");
            // Optional: Redirect user or update UI
            window.location.href = "/login"; // Example redirect
          } else {
            console.error("Failed to log out:", response.data);
          }
        } catch (error) {
          console.error("An error occurred during logout:", error);
          // Optional: Display an error message to the user
        }
      };

      if (!user){

      }
      console.log(user?.picture);

  return <div className="z-10 grid grid-cols-3 items-center sticky w-full top-0 left-0 bg-gradient-to-r  px-4 py-2  border-b-2 bg-background">
    <MenuIcon size={32} className='hover:cursor-pointer' onClick={()=>{window.location.href="/"}}></MenuIcon>
    <img onClick={()=>{window.location.href="/"}} className='justify-self-center text-secondary-foreground hover:cursor-pointer' src='sr-logo-full-colored-light.svg' alt='logo' width={240} height={240}></img>
      <div className='text-right flex justify-end'>
      {user? (
          <div className="relative inline-block text-left" ref={menuRef}>
          {user?.picture ? <Image onClick={toggleMenu} objectFit='stretch' className=' cursor-pointer rounded-full' alt='user profile pic' width={32} height={32} src={user?.picture}/>
                  :
                  (<CircleUserRound onClick={toggleMenu} width={32} height={32} className='cursor-pointer'/>)
                  }
          {isOpen && (
            <div className="absolute  right-0 mt-[0.7rem] border-0 min-w-[256px] bg-secondary rounded-sm  leading-4">
              <div className='flex flex-row place-items-center gap-2  px-2 py-2 min-h-[56px]'>
               
              {user?.picture ? <Image  objectFit='stretch' className=' rounded-full' alt='user profile pic' width={40} height={40} src={user?.picture}/>
                  :
                  (<CircleUserRound width={40} height={24} className=''/>)
                  }
                  <span className='font-serif font-bold break-words break-all'>{user?.name}</span>
                 
                  </div>
                  <Separator className='bg-secondary-foreground'/>
              <ul className='flex flex-col '>
                <li
                  onClick={()=>{setIsOpen(false);router.push('/profile')}}
                  className="flex items-center px-4 py-2 hover:bg-secondary-hover cursor-pointer rounded-none min-h-[56px] "
                >
                  <div className='flex items-center gap-2  '> 
                  <UserCog width={24} height={24}/>
                  
                  <span className=''>View Profile</span>
                  </div>
                  
                </li>
                <li
                  // onClick={handleItemClick}
                  className="flex items-center px-4 py-2 hover:bg-secondary-hover cursor-pointer rounded-none min-h-[56px]"
                >
                  <div className='flex items-center gap-2'>
                  <Moon width={24} height={24}/>
                  <span className='mr-8'>Dark Mode</span>
                  </div>
                </li>
                <li
                  onClick={()=>{setIsOpen(false);logout();}}
                  className="flex px-4 py-2 hover:bg-secondary-hover cursor-pointer rounded-none items-center min-h-[56px]"
                >
                  <div className='flex items-center gap-2'>
                    <LogOut width={24} height={24}/>
                    <button onClick={logout}>Logout</button>
                  </div>
                  
                </li>
              </ul>
            </div>
          )}
        </div>
      ) 
      : 
      (
        <div className='relative inline-block text-left '>
                <div className='flex items-center  '>
                  <div className='flex gap-2 items-center p-2'>
                  <div className='flex items-center gap-2 justify-center '>
                  <Moon width={24} height={24}/>
                  <span className=''>Dark Mode</span>
                  
                  </div>
                  
                  </div>
                  <div onClick={()=>router.push('/login')} className='flex items-center gap-2 ml-4 hover:bg-neutralHover cursor-pointer p-2'>
                    <LogIn width={24} height={24}/>
                    <button >Login</button>
                  </div>
                  
                </div>
                
                  
        </div>
      )}
    
      
  </div>
  </div>
}

export default Navbar