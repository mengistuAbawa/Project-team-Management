import { useState } from 'react';
import { demoTasks } from '../../../data/mockData.js';
export function useTasks(){const [tasks,setTasks]=useState(demoTasks);return {tasks,setTasks};}
