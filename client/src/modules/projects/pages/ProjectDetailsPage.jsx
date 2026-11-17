import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
export function ProjectDetailsPage(){const {projectId}=useParams();return <><PageHeader title="Project details" description={`Project ${projectId}`}/><div className="panel p-6 text-sm text-slate-600">Project detail, membership, milestones and deliverables will be loaded from the API in the integration phase.</div></>;}
