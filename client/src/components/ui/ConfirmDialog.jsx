import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
export function ConfirmDialog({ open, title = 'Are you sure?', message, onCancel, onConfirm }) {
  return <Modal open={open} title={title} onClose={onCancel}><p className="text-sm text-slate-600">{message}</p><div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={onCancel}>Cancel</Button><Button variant="danger" onClick={onConfirm}>Confirm</Button></div></Modal>;
}
