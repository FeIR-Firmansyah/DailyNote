"use client"
import { UseFirebase} from '../Element/ContextGiver';
import React from 'react';
import { useRouter } from 'next/navigation';
import { collection } from 'firebase/firestore';

const LogoutButton = () => {
    const router = useRouter();
    const { user,LogOut} = UseFirebase();
    let displayName = "";
    let UID = "";
    const handleLogOut = async()=>{
        await LogOut();
        router.push('/');
    }

    if(user !=null){
        displayName = user.displayName;
        UID = user.uid;
    }
    return (
        <div>
            <p>{displayName}  {UID}</p>
            <button className="border border-white-500 p-1" onClick={handleLogOut}>
                Logout from account
            </button>
        </div>
    );
};

export {LogoutButton};