export default function timeAgo(dateString) {
    const date = new Date(dateString); // Convert the date string to a Date object
    const now = new Date(); // Current date and time
    const diffInSeconds = Math.floor((now - date) / 1000); // Difference in seconds
  
    // Define the thresholds for different time units
    const units = [
      { max: 60, name: 'second', divisor: 1 },             // Seconds
      { max: 3600, name: 'minute', divisor: 60 },          // Minutes
      { max: 86400, name: 'hour', divisor: 3600 },         // Hours
      { max: 604800, name: 'day', divisor: 86400 },        // Days
      { max: 2629800, name: 'week', divisor: 604800 },     // Weeks
      { max: 31557600, name: 'month', divisor: 2629800 },  // Months
      { max: Infinity, name: 'year', divisor: 31557600 },  // Years
    ];
  
    // Find the appropriate unit for the time difference
    const unit = units.find(({ max }) => diffInSeconds < max);
    const value = Math.floor(diffInSeconds / unit.divisor);
  
    // Format the time difference in the user's locale
    return new Intl.RelativeTimeFormat(navigator.language, { numeric: 'auto' }).format(-value, unit.name);
  }