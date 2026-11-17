import { useState } from 'react';
import { demoNotifications } from '../../../data/mockData.js';
export function useNotifications(){const [items,setItems]=useState(demoNotifications);const unread=items.filter(i=>i.unread).length;return {items,setItems,unread};}
