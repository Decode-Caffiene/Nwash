function Loader({ text = "Loading…" }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-light border-t-brand-primary" />
        <p className="text-sm text-text-secondary">{text}</p>
      </div>
    </div>
  );
}

export default Loader;
