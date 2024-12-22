import { Timestamp } from "firebase/firestore";

export const getTimeDifference = (timestamp: Timestamp) => {
  const now = new Date();
  let targetDate;

  // Check if the timestamp is a Firebase Timestamp object
  if (timestamp instanceof Timestamp) {
    targetDate = timestamp.toDate();
  } else {
    // If not, assume it's a Date object or a valid date string
    targetDate = new Date(timestamp);
  }

  const diffInMs = now.getTime() - targetDate.getTime();

  // Time units and their conversions in milliseconds
  const timeUnits = [
    { label: "day", value: 24 * 60 * 60 * 1000 },
    { label: "hour", value: 60 * 60 * 1000 },
    { label: "minute", value: 60 * 1000 },
    { label: "second", value: 1000 },
  ];

  for (const { label, value } of timeUnits) {
    const diff = Math.floor(diffInMs / value);
    if (diff > 0) {
      return `${diff} ${label}${diff > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
};
