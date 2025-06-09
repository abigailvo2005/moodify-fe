import { Timestamp } from 'firebase/firestore';

// convert from Date to date String obj
export const formatDate = (
  dateInput: string | Date,
  isList: boolean
): string => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

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


// convert from String to Date obj
export const parseDate = (dateString:string) : Date => {
  try {
    if (!dateString) {
      return new Date();
    }

    const parts = dateString.split(', ');
    
    if (parts.length !== 3) {
      console.warn('Invalid date format:', dateString);
      return new Date();
    }
    
    const monthDay = parts[1]; // "January 1"
    const year = parts[2]; // "2025"
    
    // Tách month và day
    const monthDayParts = monthDay.split(' ');
    if (monthDayParts.length !== 2) {
      console.warn('Invalid month/day format:', monthDay);
      return new Date();
    }
    
    const monthName = monthDayParts[0]; // "January"
    const day = monthDayParts[1]; // "1"
    
    // Map month name to number
    const monthMap: { [key in MonthName]: number } = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3,
      'May': 4, 'June': 5, 'July': 6, 'August': 7,
      'September': 8, 'October': 9, 'November': 10, 'December': 11
    };

    type MonthName = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

    const monthIndex = monthMap[monthName as MonthName];
    if (monthIndex === undefined) {
      console.warn('Invalid month name:', monthName);
      return new Date();
    }
    
    // Tạo Date object
    const parsedDate = new Date(parseInt(year), monthIndex, parseInt(day));
    
    // Kiểm tra tính hợp lệ của date
    if (isNaN(parsedDate.getTime())) {
      console.warn('Invalid date created:', dateString);
      return new Date();
    }
    
    return parsedDate;
    
  } catch (error) {
    console.log('Error parsing date:', error);
    return new Date(); 
  }
};

export const convertTimestamps = <T>(data:any) : T => {
  const converted = { ...data };
  
  // Convert Firestore timestamps to JavaScript Dates
  if (converted.createdAt && converted.createdAt instanceof Timestamp) {
    converted.createdAt = converted.createdAt.toDate();
  }
  if (converted.updatedAt && converted.updatedAt instanceof Timestamp) {
    converted.updatedAt = converted.updatedAt.toDate();
  }
  
  return converted as T;
};

