import { useMemo } from 'react';
import { demoTasks } from '../../../data/mockData.js';
export function useReports(){return useMemo(()=>({total:demoTasks.length,completed:demoTasks.filter(t=>t.status==='Done').length}),[]);}
