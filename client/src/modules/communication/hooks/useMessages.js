import { useState } from 'react';
export function useMessages(){const [messages,setMessages]=useState([]);const addMessage=(text)=>setMessages(prev=>[...prev,{id:Date.now(),text}]);return {messages,addMessage};}
