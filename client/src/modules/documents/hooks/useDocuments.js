import { useState } from 'react';
export function useDocuments(){const [documents,setDocuments]=useState([]);return {documents,setDocuments};}
