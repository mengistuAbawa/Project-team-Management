import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
export function UserDetailsPage() { const { userId } = useParams(); return <><PageHeader title="User details" description={`Account reference: ${userId}`}/><div className="panel p-6 text-sm text-slate-600">User detail view will load the selected account from the API in the backend integration phase.</div></>; }
