import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
export function TaskDetailsPage(){const {taskId}=useParams();return <><PageHeader title="Task details" description={taskId}/><div className="panel p-6 text-sm text-slate-500">Task activity, attachments, comments and history will be displayed here.</div></>;}
