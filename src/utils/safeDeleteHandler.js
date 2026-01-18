/**
 * Safe delete handler utility to prevent ResizeObserver errors
 * when deleting items from Ant Design components (Cards, Tables, etc.)
 * 
 * Usage:
 * const handleDelete = createSafeDeleteHandler(
 *   async (itemId) => {
 *     // Your delete API call
 *     return await request({ url: `/api/items/${itemId}`, method: 'DELETE' });
 *   },
 *   (itemId) => {
 *     // Callback after successful delete (e.g., refetch data)
 *     fetchItems();
 *   }
 * );
 * 
 * @param {Function} deleteFunction - Async function that performs the delete operation
 * @param {Function} onSuccess - Callback function called after successful delete
 * @returns {Function} - Safe delete handler function
 */
export const createSafeDeleteHandler = (deleteFunction, onSuccess) => {
  return async (itemId, setDeletingId) => {
    // Set deleting state if provided
    if (setDeletingId) {
      setDeletingId(itemId);
    }

    try {
      const result = await deleteFunction(itemId);

      if (!result.error) {
        // Use requestAnimationFrame to ensure DOM updates happen after current frame
        requestAnimationFrame(() => {
          // Small delay to allow ResizeObserver to complete before refetching
          setTimeout(() => {
            if (onSuccess) {
              onSuccess(itemId);
            }
            if (setDeletingId) {
              setDeletingId(null);
            }
          }, 150);
        });
      } else {
        if (setDeletingId) {
          setDeletingId(null);
        }
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      if (setDeletingId) {
        setDeletingId(null);
      }
    }
  };
};

/**
 * Optimistically remove item from state array
 * Use this to immediately update UI before refetching
 * 
 * @param {Array} items - Current items array
 * @param {string|number} itemId - ID of item to remove
 * @param {string} idField - Field name for the ID (default: 'id')
 * @returns {Array} - New array with item removed
 */
export const optimisticallyRemoveItem = (items, itemId, idField = 'id') => {
  return items.filter((item) => item[idField] !== itemId);
};
