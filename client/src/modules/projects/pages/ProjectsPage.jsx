import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { SearchField } from '../../../components/ui/SearchField.jsx';
import { SectionCard } from '../../../components/ui/SectionCard.jsx';
import { FeatureTable } from '../../../components/ui/FeatureTable.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { demoProjects } from '../../../data/mockData.js';

export function ProjectsPage() {
  const [projects,setProjects]=useState(demoProjects);
  const [query,setQuery]=useState('');
  const [open,setOpen]=useState(false);
  const [form,setForm]=useState({name:'',client:'',dueDate:'',description:''});
  const rows=useMemo(()=>projects.filter(p=>`${p.name} ${p.client} ${p.id}`.toLowerCase().includes(query.toLowerCase())).map(p=>({...p,progressLabel:`${p.progress}%`})),[projects,query]);
  const create=(e)=>{e.preventDefault();setProjects([{id:`PRJ-${Date.now().toString().slice(-4)}`,...form,owner:'Current user',status:'Planning',progress:0,members:1,priority:'Medium'},...projects]);setOpen(false);setForm({name:'',client:'',dueDate:'',description:''});};
  return <><PageHeader title="Projects" description="Plan, organize and monitor project delivery." actions={<Button onClick={()=>setOpen(true)}><Plus size={16}/> New project</Button>}/><SectionCard title={`${projects.length} projects`} description="Search and review project portfolio." actions={<div className="w-56"><SearchField value={query} onChange={setQuery} placeholder="Search projects"/></div>}><FeatureTable columns={[{key:'id',label:'Project ID'},{key:'name',label:'Project'},{key:'client',label:'Client'},{key:'owner',label:'Owner'},{key:'status',label:'Status',badge:true},{key:'progressLabel',label:'Progress'},{key:'dueDate',label:'Due date'}]} rows={rows}/></SectionCard><Modal open={open} title="Create project" onClose={()=>setOpen(false)}><form onSubmit={create} className="space-y-3">{[['name','Project name'],['client','Client / department'],['dueDate','Due date']].map(([key,label])=><label key={key} className="block text-sm font-medium">{label}<input className="form-input mt-1" type={key==='dueDate'?'date':'text'} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required/></label>)}<label className="block text-sm font-medium">Description<textarea className="form-input mt-1" rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><div className="flex justify-end gap-2"><Button variant="secondary" type="button" onClick={()=>setOpen(false)}>Cancel</Button><Button type="submit">Create project</Button></div></form></Modal></>;
}
