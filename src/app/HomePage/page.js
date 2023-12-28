"use client"
import { NoteManager } from "../Component/Layout"
import { NoteManager2 } from "../Component/NoteManager2";
import { LogoutButton } from "../Component/LogoutButton"
import { FirebaseAuthProvider } from "../Element/ContextGiver";
import { UseFirebase } from "../Element/ContextGiver";

export default function NoteHomePage() {
    return (
        <main>
            <LogoutButton>
                
            </LogoutButton>
            <NoteManager></NoteManager>
        </main>
    )
}