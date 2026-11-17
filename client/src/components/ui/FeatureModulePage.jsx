import { PageHeader } from '../layout/PageHeader.jsx';
import { SectionCard } from './SectionCard.jsx';
import { EmptyState } from './EmptyState.jsx';
export function FeatureModulePage({title,description,section='Workspace',children}) {
  return <><PageHeader title={title} description={description}/><SectionCard title={section}>{children || <EmptyState title={`No ${title.toLowerCase()} to display`} description="This module is ready for its API-backed workflow. Add or connect records when the backend module is implemented."/>}</SectionCard></>;
}
