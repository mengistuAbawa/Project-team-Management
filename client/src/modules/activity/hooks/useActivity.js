import { useState } from 'react';
export function useActivity(){const [events,setEvents]=useState([]);return {events,setEvents};}
