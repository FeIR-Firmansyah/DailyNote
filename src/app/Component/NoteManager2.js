"use client"
import { database, app } from "../Firebase/config";
import { collection, getDoc, query, where, Timestamp, doc, updateDoc, set, serverTimestamp, deleteField } from "firebase/firestore";
import { useState, useEffect } from 'react';
import { UseFirebase } from '../Element/ContextGiver';

export function NoteManager2() {
    const [data, setData] = useState(null);
    const { user, LogOut } = UseFirebase();
    let [count, setCount] = useState(0);
    const [cardEditMap, setCardEditMap] = useState([]);
    const [refreshBool, setRefreshBool] = useState(false);
    useEffect(() => {
        setRefreshBool(false);
    }, [refreshBool])

    useEffect(() => {
        if (user == null) {
            return;
        }
        const getNote = async () => {
            const DocRef = doc(database, "CollectionOfUser", user.uid);
            const querySnapshot = await getDoc(DocRef);
            const notes = [];
            notes.push(querySnapshot.data().Note)
            setData(notes[0]);
            setCount(notes[0].CountManager.Count);
            setCardEditMap(Array(Object.keys(notes[0]).length - 1).fill().map(() => false));
            console.log("countinit:" + count + " " + JSON.stringify(Object.keys(notes[0]).length) + " " + JSON.stringify(Array(Object.keys(notes[0]).length - 1).fill().map(() => false)));
        }
        getNote();
    }, [user])

    const WriteNoteCard = (data) => {
        if (data == null) {
            return <div>No Note</div>
        }
        const CardComponent = data.map((value, index) => {
            if (value) {
                return <NoteCard>
                    
                </NoteCard>
            }
        });
    }
    const setMapTrue = ()=>{

    }
    const setMapFalse = ()=>{
        
    }

    function searchForValue(data, valueToSeach = "") {
        if (valueToSeach === "") {
            return data;
        }
        const matchingObjects = [];
        const lowerCaseValue = valueToSeach.toLowerCase();
        for (const key in data) {
            if (key === 'CountManager') {
                continue;
            }
            const note = data[key].Note.toLowerCase();
            const title = data[key].Title.toLowerCase();
            if (note.includes(lowerCaseValue) || title.includes(lowerCaseValue)) {
                matchingObjects.push(data[key]); // Push the matched object into the array
            }
        }
        return matchingObjects; // Return an array of objects that match the search value
    }

    return (
        <div>
            <div>
                <button className="border border-white-500 p-4" onClick={() => { setRefreshBool(true) }}>Refresh</button>
                <button className="border border-white-500 p-4">Add Note</button>
            </div>
            <div>
                {!refreshBool ? WriteNoteCard(searchForValue(data)) : null}
            </div>
            <div>

            </div>
        </div>
    );
}

const NoteCard = (props) => {
    const {Title,Timestamp,Note,Key,Index} = props;
    return (
        <div>
            <div>{Title}</div>
            <div>{Timestamp}</div>
            <div>{Note}</div>
            <div>{Key}:{Index}</div>
            <button className="border border-white-500 p-1" onClick={() => { HandleEditMode(Key) }}>Update</button>
            <button className="border border-white-500 p-1" onClick={DeleteData}>Delete</button>
        </div>
    )
}