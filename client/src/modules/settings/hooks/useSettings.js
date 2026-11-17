import { useState } from 'react';
export function useSettings(){const [settings,setSettings]=useState({emailNotifications:true});return {settings,setSettings};}
