export function TeamForm({name,onNameChange}){return <input className="form-input" value={name} onChange={e=>onNameChange(e.target.value)} placeholder="Team name"/>;}
