function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold text-text-primary">
        Page not found
      </h1>
      <p className="mt-3 max-w-xl text-sm text-text-secondary">
        The route you requested does not exist in the RRPCD SRIMS dashboard.
        Return to the overview to continue.
      </p>
    </div>
  );
}

export default NotFoundPage;
