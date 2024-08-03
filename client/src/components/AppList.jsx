import { useState } from "react";
//import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const initialItems = [
    { id: 'item-1', content: 'Tile 1' },
    { id: 'item-2', content: 'Tile 2' },
    { id: 'item-3', content: 'Tile 3' },
  ];

export const AppList = () => {
    

      const [items, setItems] = useState(initialItems);
      
      const handleOnDragEnd = (result) => {
        if (!result.destination) return;
    
        const reorderedItems = [...items];
        const [movedItem] = reorderedItems.splice(result.source.index, 1);
        reorderedItems.splice(result.destination.index, 0, movedItem);
    
        setItems(reorderedItems);
      };
      
  return (
    <>
    <h3>Apps Dashboard</h3>
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ padding: 8, width: 250 }}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      padding: 16,
                      marginBottom: 8,
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: 4,
                    }}
                  >
                    {item.content}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
    </>
  )
}
