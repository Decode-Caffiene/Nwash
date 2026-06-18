import agendaImg from "../../assets/agenda.jpeg";
import governLogo from "../../assets/govern.svg";

export default function Footer() {
  return (
    <footer className="w-full -mx-6 bg-[rgb(15,23,42)] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3 md:items-start">
          {/* Left: Agenda */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/80">
              Agenda
            </h3>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <img
                src={agendaImg}
                alt="Agenda"
                className="h-44 w-full object-cover"
              />
            </div>
          </div>

          {/* Middle: Government + Ministry */}
          <div className="flex flex-col">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/80">
              Government of Nepal
            </h3>
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <img
                src={governLogo}
                alt="Government"
                className="h-12 w-12 flex-shrink-0 object-contain"
              />
              <div>
                {/* Ministry text */}
                <p className="text-base font-bold leading-tight">
                  Ministry of Water Supply
                </p>
                <p className="mt-1 text-sm text-white/75">
                  Department of Water Supply and Sewerage Management
                </p>
              </div>
            </div>
          </div>

          {/* Right: Social links */}
          <div className="flex flex-col">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/80">
              Social
            </h3>
            <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <a
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white"
                href="#"
                target="_blank"
                rel="noreferrer"
              >
                <span aria-hidden>▶</span>
                YouTube
              </a>
              <a
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white"
                href="#"
                target="_blank"
                rel="noreferrer"
              >
                <span aria-hidden>f</span>
                Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} DWSSM Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
