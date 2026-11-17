import { useState } from 'react';
const seed=[{id:'TEAM-01',name:'Frontend Engineering',lead:'David Kim',members:6}];
export function useTeams(){const [teams,setTeams]=useState(seed);return {teams,setTeams};}
