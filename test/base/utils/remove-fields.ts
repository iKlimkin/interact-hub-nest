export const removeUnwantedFields = (data, fieldsToRemove) => {
    const items = data.items.map((item) => {
      const newItem = { ...item };
      fieldsToRemove.forEach((field) => {
        delete newItem[field];
      });
      return newItem;
    });
    return { ...data, items }
  };