export function Avatar({ name = 'User', size = 'md', image }) {
  const sizes = { sm: 'h-8 w-8 text-[10px]', md: 'h-10 w-10 text-xs', lg: 'h-12 w-12 text-sm' };
  const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-bold text-indigo-700 ${sizes[size]}`}>
    {initials}
    {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover"
      onError={(event) => event.currentTarget.remove()} />}
  </div>;
}
