import { useState } from 'react';
import { demoProjects } from '../../../data/mockData.js';
export function useProjects(){const [projects,setProjects]=useState(demoProjects);return {projects,setProjects};}
