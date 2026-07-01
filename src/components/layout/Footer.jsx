import { Youtube, Facebook } from "lucide-react";
import agendaImg from "../../assets/agenda.jpeg";
import wateraidLogo from "../../assets/wateraid.webp";

export default function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-surface-border bg-[rgb(15,23,42)] px-6 py-4">
      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Supported by
        </span>
        <div className="mt-2 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <img
              src={agendaImg}
              alt="Agenda for Change"
              className="h-8 w-auto object-contain"
            />
            <span className="whitespace-nowrap text-sm font-medium text-text-primary">
              Agenda for Change
            </span>
          </div>
          <div className="flex items-center gap-2">
            <img
              src={wateraidLogo}
              alt="Water Aid"
              className="h-8 w-auto object-contain"
            />
            <span className="whitespace-nowrap text-sm font-medium text-text-primary">
              Water Aid
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Contact Us
        </span>
        <p className="mt-1 text-sm text-text-primary">+977-1-1234567</p>
        <div className="mt-1 flex items-center gap-3">
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            className="text-text-secondary transition hover:text-brand-primary"
          >
            <Youtube size={18} />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            className="text-text-secondary transition hover:text-brand-primary"
          >
            <Facebook size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
