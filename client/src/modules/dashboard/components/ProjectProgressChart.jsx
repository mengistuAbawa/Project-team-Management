import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
const data = [{name:'Completed',value:34},{name:'In progress',value:48},{name:'At risk',value:18}];
const colors = ['#10b981','#6366f1','#f59e0b'];
export function ProjectProgressChart() {
  return <section className="panel p-5"><h2 className="font-bold">Portfolio health</h2><div className="mt-3 h-52"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={78} paddingAngle={4}>{data.map((entry,index)=><Cell key={entry.name} fill={colors[index]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div><div className="flex flex-wrap justify-center gap-4">{data.map((d,i)=><span key={d.name} className="flex items-center gap-2 text-xs text-slate-500"><i className="h-2 w-2 rounded-full" style={{background:colors[i]}}/>{d.name} {d.value}%</span>)}</div></section>;
}
