"use client"
import { UseFirebase, ExampleProvider } from '../Element/ContextGiver';
import React from 'react';
import { useRouter } from 'next/navigation';

const LoginButton = () => {
    const router = useRouter();
    const { user, LogIn} = UseFirebase();

    const handleLogin = async () => {
        if(user!==null){
            router.push("/HomePage");
            return;
        }
        await LogIn();
        router.push("/HomePage");
    }
    return (
        <div>
            <button className="border border-white-500 p-1" onClick={handleLogin}>
                Login With Google
            </button>
        </div>

    );
};

export { LoginButton };