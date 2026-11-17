export function RoleCard({ role }) {
  const Icon = role.icon;
  return (
    <article className="public-role-card">
      <span className={`public-role-icon role-${role.color}`}><Icon size={22} aria-hidden="true" /></span>
      <h3>{role.name}</h3>
      <p>{role.description}</p>
    </article>
  );
}
