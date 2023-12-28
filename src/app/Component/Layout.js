"use client"
import { database, app } from "../Firebase/config";
import { collection, getDoc, query, where, Timestamp, doc, updateDoc, set, serverTimestamp, deleteField } from "firebase/firestore";
import { useState, useEffect } from 'react';
import { UseFirebase } from '../Element/ContextGiver';
import { jsonEval } from "@firebase/util";

function NoteManager({ children }) {

    const [data, setData] = useState(null);
    const { user, LogOut } = UseFirebase();
    const [refreshBool, setRefreshBool] = useState(false);
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [cardEditMap, setCardEditMap] = useState([]);
    let [ search,setSearch ] = useState("");
    let [count, setCount] = useState(0);
    useEffect(() => {
        if (user == null) {
            return
        }

        const getNote = async () => {
            /*const q = query(CollectionOfUser,
                where("Username", "==", "Firgi Firmansyah")
            );*/
            //const CollectionOfUserRef = collection(database, "CollectionOfUser");
            const DocRef = doc(database, "CollectionOfUser", user.uid);
            const querySnapshot = await getDoc(DocRef);
            const notes = [];
            notes.push(querySnapshot.data().Note)
            /*
            querySnapshot.forEach((docFromFirebase) => {
                notes.push(docFromFirebase.data().Note);
            })*/
            setData(notes[0]); // Update state with fetched data */
            setCount(notes[0].CountManager.Count);
            setCardEditMap(Array(Object.keys(notes[0]).length - 1).fill().map(() => false));
            console.log("countinit:" + count + " " + JSON.stringify(Object.keys(notes[0]).length) + " " + Array(Object.keys(notes[0]).length - 1).fill().map(() => false));
        }
        getNote();
    }, [user]);

    const HandleRefresh = () => {
        setRefreshBool(true);
    }

    const HandleShowNewNoteInput = () => {
        setShowNoteInput(true);
    }

    const HandleEditMode = (index) => {
        const maptmp = cardEditMap;
        maptmp[parseInt(index)] = !maptmp[parseInt(index)];
        console.log("HandleEditMode:" + parseInt(index));
        setCardEditMap(maptmp);
        HandleRefresh();
    }

    useEffect(() => {
        setRefreshBool(false);
    }, [refreshBool])

    function searchForValue(data, valueToSeach = "") {
        if (valueToSeach === "") {
            return data;
        }
        const matchingObjects = {};
        const lowerCaseValue = valueToSeach.toLowerCase();
        for (const key in data) {
            if (key === 'CountManager') {
                continue;
            }
            const note = data[key].Note.toLowerCase();
            const title = data[key].Title.toLowerCase();
            if (note.includes(lowerCaseValue) || title.includes(lowerCaseValue)) {
                matchingObjects[key] = data[key]; // Push the matched object into the array
            }
        }
        console.log("search:" + JSON.stringify(matchingObjects));
        return matchingObjects; // Return an array of objects that match the search value
    }
    function deleteNoteFromLocalData(Key) {
        const datatemp = data;
        delete datatemp[`${Key}`];
        console.log("deletedata:" + JSON.stringify(datatemp))
        setData(datatemp);
    }

    function updateNoteFromLocalData(Key, updateData) {
        const datatemp = data;
        datatemp[`${Key}`] = updateData;
        console.log("updateNoteFromLocalData:" + JSON.stringify(datatemp))
        setData(datatemp);
    }

    function addNewNoteToLocalData(newData) {
        console.log(count);
        setCount(count + 1);
        data[(parseInt(count) + 1)] = newData;
        console.log("updateNoteLocalData:" + JSON.stringify(data) + " " + (parseInt(count) + 1));
    }

    const updateFirebaseData = async (data) => {
        if (user == null) {
            return;
        }
        const DocRef = doc(database, "CollectionOfUser", user.uid);
        const updateData = {};
        console.log("updateFirebase:" + JSON.stringify(data) + " " + (parseInt(count) + 1));

        // Update the specific note using the provided Key
        updateData[`Note.${(parseInt(count) + 1)}.Title`] = data["Title"];
        updateData[`Note.${(parseInt(count) + 1)}.Note`] = data["Note"];
        updateData[`Note.${(parseInt(count) + 1)}.TimeStamp`] = serverTimestamp();
        updateData[`Note.CountManager.Count`] = (parseInt(count) + 1);
        await updateDoc(DocRef, updateData);
    }

    const SearchHandler = (stringSearch)=>{
        setSearch(stringSearch);
    }

    const WriteComponent = (data) => {
        if (data == null) {
            return (
                <NoneNoteCard>
                </NoneNoteCard>
            )
        }
        const objectKey = Object.keys(data);
        const objectValue = Object.values(data);
        console.log("writeComponent:"+JSON.stringify(data));
        return (
            <div>
                {objectKey.map((key, index) => {
                    if (key === "CountManager") {
                        return null; // Skips rendering for "CountManager"
                    }
                    console.log("cekwrite:" + JSON.stringify(cardEditMap[parseInt(index)]))
                    let timeStamp = "ServerTimeStamp Still Unknown";
                    try {
                        timeStamp = objectValue[index]["TimeStamp"].toDate().toString();
                    } catch { }
                    return (
                        <div>
                            {cardEditMap[index] === true ?
                                <NoteCardEditMode
                                    user={user}
                                    Title={objectValue[index]["Title"]}
                                    Note={objectValue[index]["Note"]}
                                    Key={parseInt(key)}
                                    Index={index}
                                    HandleRefresh={() => { HandleRefresh() }}
                                    HandleEditMode={(index) => { HandleEditMode(index) }}
                                    updateNoteFromLocalData={(index, updateData) => updateNoteFromLocalData(index, updateData)}
                                ></NoteCardEditMode>
                                : <NoteCard
                                    Title={objectValue[index]["Title"]}
                                    Note={objectValue[index]["Note"]}
                                    Timestamp={timeStamp}
                                    Key={parseInt(key)}
                                    Index={index}
                                    HandleRefresh={() => { HandleRefresh() }}
                                    deleteNoteFromLocalData={(index) => { deleteNoteFromLocalData(index) }}
                                    updateNoteFromLocalData={(index, updateData) => updateNoteFromLocalData(index, updateData)}
                                    HandleEditMode={(index) => { HandleEditMode(index) }}
                                >
                                </NoteCard>
                            }
                        </div>
                    );
                })}
            </div>
        );
    }
    //data[0]["1"].Note {`Judul: ${objectValue[index]["Title"]}`} 
    return (
        <div>
            <div>
                <form>
                    <input
                        className="text-black"
                        type="text"
                        id="title"
                        value={search}
                        onChange={(e) => { SearchHandler(e.target.value) }}
                        placeholder="You want to search something ...?"
                        required
                    />
                </form>
                <button className="border border-white-500 p-4" onClick={() => { HandleRefresh() }}>Refresh</button>
                <button className="border border-white-500 p-4" onClick={() => { HandleShowNewNoteInput() }}>Add New Note</button>
            </div>
            {refreshBool === false && data !== null ? WriteComponent(searchForValue(data, search)) : null}
            {showNoteInput ?
                <InputComponent
                    addNewNoteToLocalData={(data) => { addNewNoteToLocalData(data) }}
                    updateFirebaseData={(data) => { updateFirebaseData(data) }}
                    HandleRefresh={() => { HandleRefresh() }}
                    setShowNoteInput={(value) => { setShowNoteInput(value) }}
                >
                </InputComponent>
                : null
            }
        </div>
    )
}

const InputComponent = (props) => {
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const { addNewNoteToLocalData, updateFirebaseData, HandleRefresh, setShowNoteInput } = props;

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleNoteChange = (e) => {
        setNote(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newObject = {};
        newObject["Title"] = title;
        newObject["Note"] = note;
        newObject["TimeStamp"] = serverTimestamp();
        addNewNoteToLocalData(newObject);
        updateFirebaseData(newObject);
        setShowNoteInput(false);
        HandleRefresh();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="title">Title:</label>
                <input
                    className="text-black"
                    type="text"
                    id="title"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Enter title..."
                    required
                />
            </div>
            <div>
                <label htmlFor="note">Note:</label>
                <textarea
                    className="text-black"
                    id="note"
                    value={note}
                    onChange={handleNoteChange}
                    placeholder="Enter note..."
                    required
                />
            </div>
            <button className="border border-white-500 p-1" type="submit">Submit</button>
        </form>
    );
};

function NoteCard(props) {
    const { user, LogOut } = UseFirebase();
    if (user == null) {
        return;
    }
    const DocRef = doc(database, "CollectionOfUser", user.uid);
    const { Title, Note, Timestamp, Key, HandleRefresh, deleteNoteFromLocalData, updateNoteFromLocalData, Index, HandleEditMode } = props;


    const DeleteData = async () => {
        const deleteObject = {};
        // Update the specific note using the provided Key
        deleteObject[`Note.${Key}`] = deleteField();
        await updateDoc(DocRef, deleteObject);
        deleteNoteFromLocalData(Key);
        HandleRefresh();
    }
    const NoteShowMode = () => {
        return (
            <div>
                <div>{Title}</div>
                <div>{Timestamp}</div>
                <div>{Note}</div>
                <div>{Key}:{Index}</div>
                <button className="border border-white-500 p-1" onClick={() => { HandleEditMode(Index) }}>Update</button>
                <button className="border border-white-500 p-1" onClick={DeleteData}>Delete</button>
            </div>
        )
    }
    return (
        <div>
            <NoteShowMode></NoteShowMode>
        </div>
    )
}
const NoteCardEditMode = (props) => {
    const { Title, Note, updateNoteFromLocalData, HandleEditMode, Key, Index, user } = props;
    if (user == null) {
        return;
    }
    const [title, setTitle] = useState(Title);
    const [note, setNote] = useState(Note);
    const DocRef = doc(database, "CollectionOfUser", user.uid);
    const UpdateNote = async () => {
        const updateData = {};
        const localUpdateData = {};
        updateData[`Note.${Key}.Title`] = title;
        updateData[`Note.${Key}.Note`] = note;
        updateData[`Note.${Key}.Timestamp`] = serverTimestamp();
        localUpdateData[`Title`] = updateData[`Note.${Key}.Title`];
        localUpdateData[`Note`] = updateData[`Note.${Key}.Note`];
        localUpdateData[`Timestamp`] = updateData[`Note.${Key}.Timestamp`];
        updateNoteFromLocalData(Key, localUpdateData);
        await updateDoc(DocRef, updateData);
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        UpdateNote();
        HandleEditMode(Index);
    };
    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="title">Title:</label>
                <input
                    className="text-black"
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value) }}
                    placeholder="Enter title..."
                    required
                />
            </div>
            <div>
                <label htmlFor="note">Note:</label>
                <textarea
                    className="text-black"
                    id="note"
                    value={note}
                    onChange={(e) => { setNote(e.target.value) }}
                    placeholder="Enter note..."
                    required
                />
            </div>
            <button className="border border-white-500 p-1" type="submit">Submit</button>
        </form>
    );
}

function NoneNoteCard() {
    return (
        <div>
            <div>No Note</div>
        </div>
    )
}

export { NoteManager, NoteCard };