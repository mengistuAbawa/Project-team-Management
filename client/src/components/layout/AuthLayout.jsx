import { Outlet } from 'react-router-dom';
import { PageMeta } from '../public/PageMeta.jsx';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageMeta title="Sign in" description="Sign in to your private PTMS workspace." noindex />
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-[#14213d] to-blue-700 p-12 text-white lg:flex xl:p-16">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
          <div className="absolute -bottom-48 -left-32 h-[32rem] w-[32rem] rounded-full border border-white/10" />
          <div className="relative flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-lg font-black ring-1 ring-white/15">T</span>
            <span className="text-lg font-extrabold tracking-tight">TeamFlow</span>
          </div>
          <div className="relative max-w-lg">
            <p className="mb-4 text-xs font-bold uppercase tracking-[.24em] text-blue-200">Work better together</p>
            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">One workspace.<br />Every team moving forward.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-blue-100/80 xl:text-lg">
              Bring projects, people, and progress into one clear view.
            </p>
            <div className="mt-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-400/15 text-teal-300">✓</span>
              <div>
                <p className="text-sm font-semibold">Everything in sync</p>
                <p className="mt-0.5 text-xs text-blue-100/70">A calmer way to move work forward.</p>
              </div>
            </div>
          </div>
          <p className="relative text-xs text-blue-100/60">Project Team Management System</p>
        </aside>
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
