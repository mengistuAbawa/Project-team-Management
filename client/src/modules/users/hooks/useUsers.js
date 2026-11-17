import { useState } from 'react';
import { demoUsers } from '../../../data/mockData.js';
export function useUsers() { const [users,setUsers]=useState(demoUsers); return {users,setUsers}; }
