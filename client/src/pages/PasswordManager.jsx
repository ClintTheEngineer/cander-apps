import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Constants } from './Constants';

const PasswordManager = () => {
    const [entries, setEntries] = useState([]);
    const [newEntry, setNewEntry] = useState({ siteName: '', url: '', username: '', password: '' });
    const [showPasswords, setShowPasswords] = useState({});
    const [editMode, setEditMode] = useState({});
    const [randomPassword, setRandomPassword] = useState('');

    useEffect(() => {
        fetch(`${Constants.SERVER_URL}entries`)
            .then(response => response.json())
            .then(data => setEntries(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    const handleAddEntry = () => {
        fetch(`${Constants.SERVER_URL}entries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newEntry)
        })
        .then(response => response.json())
        .then(data => {
            setEntries([...entries, data]);
            setNewEntry({ siteName: '', url: '', username: '', password: '' });
        })
        .catch(error => console.error('Error adding entry:', error));
    };

    const handleGeneratePassword = () => {
        fetch(`${Constants.SERVER_URL}test-password`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            setRandomPassword(data.password); // Assuming the response contains the password in data.password
            setNewEntry(prevEntry => ({
                ...prevEntry,
                password: data.password
            }));
        })
        .catch(error => console.error('Error generating password:', error));
    }

    const handleEditEntry = (id, updatedEntry) => {
        fetch(`${Constants.SERVER_URL}entries/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedEntry)
        })
        .then(response => response.json())
        .then(data => {
            setEntries(entries.map(entry => (entry.id === id ? data : entry)));
            setEditMode({ ...editMode, [id]: false });
        })
        .catch(error => console.error('Error updating entry:', error));
    };

    const handleDeleteEntry = (id) => {
        fetch(`${Constants.SERVER_URL}entries/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            setEntries(entries.filter(entry => entry.id !== id));
        })
        .catch(error => console.error('Error deleting entry:', error));
    };

    const handleCopyPassword = async (id) => {
        try {
            const response = await fetch(`${Constants.SERVER_URL}entries/${id}`);
            const data = await response.json();
            const password = data.password;
            await navigator.clipboard.writeText(password);
            alert('Password copied to clipboard');
        } catch (err) {
            console.error('Failed to copy password:', err);
        }
    };

    const handleShowPassword = async (id) => {
        const shouldShow = !showPasswords[id];
        setShowPasswords(prev => ({ ...prev, [id]: shouldShow }));
    
        if (shouldShow) {
            try {
                const response = await fetch(`${Constants.SERVER_URL}entries/${id}`);
                const data = await response.json();
                setEntries(prevEntries => prevEntries.map(entry =>
                    entry.id === id ? { ...entry, password: data.password } : entry
                ));
            } catch (err) {
                console.error('Failed to fetch decrypted password:', err);
            }
        }
    };

    const toggleEditMode = (id) => {
        if (!editMode[id]) {
            const entryToEdit = entries.find(entry => entry.id === id);
            setEditMode({ ...editMode, [id]: entryToEdit });
        } else {
            setEditMode({ ...editMode, [id]: false });
        }
    };


    const handleSaveEntry = (id, entry) => {
        handleEditEntry(id, entry);
    };


    const handleCopyGeneratedPassword = async () => {
        try {
            await navigator.clipboard.writeText(randomPassword);
            alert('Generated password copied to clipboard');
        } catch (err) {
            console.error('Failed to copy generated password:', err);
        }
    };
    
    



    return (
        <>
            <Navbar />
            <h1>Password Manager</h1>

            <div>
            <aside>
                    <h2>Generate Random Password:</h2>
                    <button onClick={handleGeneratePassword}>Generate</button>
                    {randomPassword && (
                        <>
                            <div id='password'>{randomPassword}</div>
                            {randomPassword && (
                                <button onClick={handleCopyGeneratedPassword}>Copy</button>
                            )}
                        </>
                    )}
                </aside>

                <h2>Add New Entry</h2>
                <input
                    type="text"
                    placeholder="Site Name"
                    value={newEntry.siteName}
                    onChange={(e) => setNewEntry({ ...newEntry, siteName: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="URL"
                    value={newEntry.url}
                    onChange={(e) => setNewEntry({ ...newEntry, url: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={newEntry.username}
                    onChange={(e) => setNewEntry({ ...newEntry, username: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={newEntry.password}
                    onChange={(e) => setNewEntry({ ...newEntry, password: e.target.value })}
                />
                <button onClick={handleAddEntry}>Add Entry</button>
            </div>

            <h2>Entries</h2>
            <ul>
    {entries.map((entry, index) => (
        <section key={index}>
            {editMode[entry.id] ? (
    <>
        <input
            type="text"
            value={editMode[entry.id]?.siteName || ''}
            onChange={(e) => setEditMode(prev => ({
                ...prev,
                [entry.id]: { ...prev[entry.id], siteName: e.target.value }
            }))}
        />
        <input
            type="text"
            value={editMode[entry.id]?.url || ''}
            onChange={(e) => setEditMode(prev => ({
                ...prev,
                [entry.id]: { ...prev[entry.id], url: e.target.value }
            }))}
        />
        <input
            type="text"
            value={editMode[entry.id]?.username || ''}
            onChange={(e) => setEditMode(prev => ({
                ...prev,
                [entry.id]: { ...prev[entry.id], username: e.target.value }
            }))}
        />
        <input
            type="text"
            value={editMode[entry.id]?.password || ''}
            onChange={(e) => setEditMode(prev => ({
                ...prev,
                [entry.id]: { ...prev[entry.id], password: e.target.value }
            }))}
        />
        <button onClick={() => handleSaveEntry(entry.id, editMode[entry.id])}>
            Save
        </button>
        <button onClick={() => toggleEditMode(entry.id)}>Cancel</button>
    </>
) : (
    <>
        <p>Site Name: <span>{entry.sitename}</span></p>
        <p>URL: <span>{entry.url}</span></p>
        <p>Username: <span>{entry.username}</span></p>
        <p>Password: 
            <span>{showPasswords[entry.id] ? entry.password : '••••••••'}</span>
        </p>
        <button onClick={() => toggleEditMode(entry.id)}>Edit</button>
        <button onClick={() => handleShowPassword(entry.id)}>
            {showPasswords[entry.id] ? 'Hide' : 'Show'} Password
        </button>
        <button onClick={() => handleCopyPassword(entry.id)}>Copy</button>
        <button onClick={() => handleDeleteEntry(entry.id)}>Delete</button>
    </>
)}

        </section>
    ))}
</ul>

        </>
    );
};

export default PasswordManager;
