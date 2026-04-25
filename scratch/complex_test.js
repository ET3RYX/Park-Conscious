import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 50,
  duration: '1m',
};

export default function () {
  // 1. Visit Home Page
  const homeRes = http.get('https://events.parkconscious.in');
  check(homeRes, { 'status is 200 (Home)': (r) => r.status === 200 });
  sleep(1);

  // 2. Fetch Events from API (This hits your Database)
  const apiRes = http.get('https://events.parkconscious.in/api/events');
  check(apiRes, { 'status is 200 (API)': (r) => r.status === 200 });
  
  // 3. Simulate "Clicking" an event (if list exists)
  if (apiRes.status === 200) {
    const events = apiRes.json();
    if (events && events.length > 0) {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const eventRes = http.get(`https://events.parkconscious.in/event/${randomEvent.slug || randomEvent._id}`);
      check(eventRes, { 'status is 200 (Event Page)': (r) => r.status === 200 });
    }
  }
  
  sleep(2);
}
