import { useState, useRef } from 'react';

const initialItems = [];

const fetchFaviconUrl = async (url) => {
    const faviconUrl = new URL('/favicon.ico', url).href;
    return new Promise((resolve) => {
        const img = new Image();
        img.src = faviconUrl;
        img.onload = () => resolve(faviconUrl);
        img.onerror = () => resolve(''); // Fallback if favicon not found
    });
};

export const AppList = () => {
    const [items, setItems] = useState(initialItems);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [newTileName, setNewTileName] = useState('');
    const [newTileUrl, setNewTileUrl] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showMenu, setShowMenu] = useState(null); // Track which tile's menu is open
    const dragStartIndexRef = useRef(null);

    const handleDragStart = (index, e) => {
        e.dataTransfer.effectAllowed = 'move'; // Indicate that the action is a move
        dragStartIndexRef.current = index;
        setDraggingIndex(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Required to allow dropping
        e.stopPropagation(); // Prevents bubbling up
    };

    const handleDrop = (index, e) => {
        e.preventDefault(); // Prevent default behavior
        e.stopPropagation(); // Prevents bubbling up

        const fromIndex = dragStartIndexRef.current;
        if (fromIndex === null || fromIndex === index) return;

        const reorderedItems = [...items];
        const [movedItem] = reorderedItems.splice(fromIndex, 1);
        reorderedItems.splice(index, 0, movedItem);

        setItems(reorderedItems);
        setDraggingIndex(null);
        dragStartIndexRef.current = null;
    };

    const handleDragEnd = () => {
        // Clear the dragging index when drag operation ends
        setDraggingIndex(null);
        dragStartIndexRef.current = null;
    };

    const handleAddTile = async (e) => {
        e.preventDefault();
        if (!newTileName.trim() || !newTileUrl.trim()) return;

        const faviconUrl = await fetchFaviconUrl(newTileUrl);

        const newItem = {
            id: `item-${items.length + 1}`, // Generate a new ID
            content: newTileName.trim(), // Use user input for content
            favicon: faviconUrl, // Favicon URL
            url: newTileUrl.trim(), // Store the URL for copying
        };
        setItems([...items, newItem]);
        setNewTileName('');
        setNewTileUrl('');
        setShowForm(false);
    };

    const handleRemoveTile = (id) => {
        const filteredItems = items.filter(item => item.id !== id);
        setItems(filteredItems);
        setShowMenu(null); // Close the menu after removal
    };

    const handleCopyLink = (url) => {
        navigator.clipboard.writeText(url).then(
            () => alert('Link copied to clipboard!'),
            (err) => alert('Failed to copy link: ', err)
        );
    };

    const toggleMenu = (index) => {
        setShowMenu(showMenu === index ? null : index);
    };

    return (
        <>
            <h3>Apps Dashboard</h3>
            <button 
                onClick={() => setShowForm(!showForm)}
                style={{ marginBottom: 16 }}
            >
                {showForm ? 'Cancel' : 'Add Tile'}
            </button>

            {showForm && (
                <form onSubmit={handleAddTile} style={{ marginBottom: 16 }}>
                    <input
                        type="text"
                        value={newTileName}
                        onChange={(e) => setNewTileName(e.target.value)}
                        placeholder="Enter tile name"
                        required
                        style={{ marginRight: 8 }}
                    />
                    <input
                        type="url"
                        value={newTileUrl}
                        onChange={(e) => setNewTileUrl(e.target.value)}
                        placeholder="Enter URL"
                        required
                        style={{ marginRight: 8 }}
                    />
                    <button type="submit">Add Tile</button>
                </form>
            )}

            <main>
                <div className="tiles" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(index, e)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(index, e)}
                            onDragEnd={handleDragEnd}
                            style={{
                                padding: 16,
                                width: 125,
                                height: 125,
                                backgroundColor: '#fff',
                                border: '1px solid #ccc',
                                borderRadius: 4,
                                display: 'grid',
                                gridTemplateColumns: '40px 1fr auto',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 16, // Increased space between rows
                                cursor: 'move',
                                opacity: draggingIndex === index ? 0.5 : 1,
                                position: 'relative', // To position the dropdown menu
                            }}
                        >
                            {item.favicon ? (
                                <img
                                    src={item.favicon}
                                    alt="Favicon"
                                    style={{ width: 24, height: 24, borderRadius: '50%' }}
                                />
                            ) : (
                                <div style={{ width: 24, height: 24 }} />
                            )}
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.content}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <button 
                                    className="menu-btn"
                                    onClick={() => toggleMenu(index)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 4,
                                    }}
                                >
                                    ☰ {/* Mini-hamburger icon */}
                                </button>
                                {showMenu === index && (
                                    <div style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: '100%',
                                        backgroundColor: '#000',
                                        border: '1px solid #ccc',
                                        borderRadius: 4,
                                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
                                        zIndex: 10,
                                    }}>
                                        <button
                                            onClick={() => handleRemoveTile(item.id)}
                                            style={{
                                                display: 'block',
                                                padding: '8px 16px',
                                                border: 'none',
                                                background: 'none',
                                                cursor: 'pointer',
                                                width: '100%',
                                                textAlign: 'left',
                                            }}
                                        >
                                            Remove
                                        </button>
                                        <button
                                            onClick={() => handleCopyLink(item.url)}
                                            style={{
                                                display: 'block',
                                                padding: '8px 16px',
                                                border: 'none',
                                                background: 'none',
                                                cursor: 'pointer',
                                                width: '100%',
                                                textAlign: 'left',
                                            }}
                                        >
                                            Copy Link
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
};
