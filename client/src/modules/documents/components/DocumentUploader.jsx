export function DocumentUploader({onSelect}){return <input type="file" onChange={e=>onSelect(e.target.files?.[0]||null)}/>;}
