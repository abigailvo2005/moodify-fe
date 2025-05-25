
// export const formatDate = (dateInput: string | Date): string => {
//   const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
//   return date.toLocaleDateString('en-EN', {
//     weekday: 'short',
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric',
//   });
// };

export const formatDate = (dateInput: string | Date, isList: boolean): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

    // const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString() && isList) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString() && isList) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };