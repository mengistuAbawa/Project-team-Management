export function ReviewForm({value,onChange}){return <textarea className="form-input" rows="4" value={value} onChange={e=>onChange(e.target.value)} placeholder="Write review feedback..."/>;}
