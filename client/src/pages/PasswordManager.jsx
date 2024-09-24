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
            headers: { 'Content-Type': 'application/json' },
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
        fetch(`${Constants.SERVER_URL}test-password`)
            .then(response => response.json())
            .then(data => {
                setRandomPassword(data.password);
                setNewEntry(prev => ({ ...prev, password: data.password }));
            })
            .catch(error => console.error('Error generating password:', error));
    };

    const handleEditEntry = (id, updatedEntry) => {
        fetch(`${Constants.SERVER_URL}entries/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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
        fetch(`${Constants.SERVER_URL}entries/${id}`, { method: 'DELETE' })
            .then(() => {
                setEntries(entries.filter(entry => entry.id !== id));
            })
            .catch(error => console.error('Error deleting entry:', error));
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

    return (
        <div className="container">
            <Navbar />
            <h1 className="title">Password Manager</h1>

            <div className="section">
                <h2>Generate Random Password:</h2>
                <button className="button" onClick={handleGeneratePassword}>Generate</button>
                {randomPassword && (
                    <div>
                        <span className="password-display">{randomPassword}</span>
                        <button className="button" onClick={() => navigator.clipboard.writeText(randomPassword)}>Copy</button>
                    </div>
                )}
            </div>

            <div className="section">
                <h2>Add New Entry</h2>
                <input
                    className="input"
                    type="text"
                    placeholder="Site Name"
                    value={newEntry.siteName}
                    onChange={(e) => setNewEntry({ ...newEntry, siteName: e.target.value })}
                />
                <input
                    className="input"
                    type="text"
                    placeholder="URL"
                    value={newEntry.url}
                    onChange={(e) => setNewEntry({ ...newEntry, url: e.target.value })}
                />
                <input
                    className="input"
                    type="text"
                    placeholder="Username"
                    value={newEntry.username}
                    onChange={(e) => setNewEntry({ ...newEntry, username: e.target.value })}
                />
                <input
                    className="input"
                    type="password"
                    placeholder="Password"
                    value={newEntry.password}
                    onChange={(e) => setNewEntry({ ...newEntry, password: e.target.value })}
                />
                <button className="button" onClick={handleAddEntry}>Add Entry</button>
            </div>

            <div className="section">
                <h2>Entries</h2>
                <ul>
                    {entries.map((entry, index) => (
                        <li key={index}>
                            {editMode[entry.id] ? (
                                <>
                                    <input
                                        className="input"
                                        type="text"
                                        value={editMode[entry.id]?.siteName || ''}
                                        onChange={(e) => setEditMode(prev => ({
                                            ...prev,
                                            [entry.id]: { ...prev[entry.id], siteName: e.target.value }
                                        }))}
                                    />
                                    <input
                                        className="input"
                                        type="text"
                                        value={editMode[entry.id]?.url || ''}
                                        onChange={(e) => setEditMode(prev => ({
                                            ...prev,
                                            [entry.id]: { ...prev[entry.id], url: e.target.value }
                                        }))}
                                    />
                                    <input
                                        className="input"
                                        type="text"
                                        value={editMode[entry.id]?.username || ''}
                                        onChange={(e) => setEditMode(prev => ({
                                            ...prev,
                                            [entry.id]: { ...prev[entry.id], username: e.target.value }
                                        }))}
                                    />
                                    <input
                                        className="input"
                                        type="password"
                                        value={editMode[entry.id]?.password || ''}
                                        onChange={(e) => setEditMode(prev => ({
                                            ...prev,
                                            [entry.id]: { ...prev[entry.id], password: e.target.value }
                                        }))}
                                    />
                                    <button className="button" onClick={() => handleEditEntry(entry.id, editMode[entry.id])}>Save</button>
                                    <button className="button" onClick={() => setEditMode({ ...editMode, [entry.id]: false })}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <p>Site Name: <strong>{entry.sitename}</strong></p>
                                    <p>URL: <strong>{entry.url}</strong></p>
                                    <p>Username: <strong>{entry.username}</strong></p>
                                    <p>Password: <strong>{showPasswords[entry.id] ? entry.password : '••••••••'}</strong></p>
                                    <button className="button" onClick={() => setEditMode({ ...editMode, [entry.id]: entry })}>Edit</button>
                                    <button className="button" onClick={() => handleShowPassword(entry.id)}>
                                        {showPasswords[entry.id] ? 'Hide' : 'Show'} Password
                                    </button>
                                    <button className="button" onClick={() => handleDeleteEntry(entry.id)}>Delete</button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PasswordManager;
