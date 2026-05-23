export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={"font-bold tracking-tight lowercase " + className}
      style={{ letterSpacing: "-0.02em" }}
    >
      frently
      <span className="align-super text-[0.55em] ml-0.5 opacity-70">®</span>
    </span>
  );
}
