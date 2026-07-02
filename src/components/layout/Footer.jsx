import { Link } from "react-router-dom";
import { Youtube, Facebook, Phone, Mail, MapPin, ChevronRight } from "lucide-react";
import agendaImg from "../../assets/agenda.jpeg";
import wateraidLogo from "../../assets/wateraid.webp";

const quickLinks = [
  { label: "Overview", to: "/overview" },
  { label: "Regulatory Roadmap", to: "/regulatory-roadmap" },
  { label: "Service Providers", to: "/service-providers" },
  { label: "GIS Map", to: "/gis-map" },
  { label: "Analytics", to: "/analytics" },
  { label: "Research", to: "/research" },
  { label: "Downloads", to: "/downloads" },
];

export default function Footer() {
  return (
    <footer>
      <div className="bg-[rgb(15,23,42)]">
        {/* Top decorative gradient border */}
        <div className="h-1 bg-gradient-to-r from-brand-primary via-blue-400 to-brand-primary" />

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Supported by */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                Supported by
              </h3>
              <div className="space-y-4">
                <div className="group flex items-center gap-3">
                  <div className="flex-shrink-0 overflow-hidden rounded-lg bg-white/10 p-1.5 transition group-hover:bg-white/20">
                    <img
                      src={agendaImg}
                      alt="Agenda for Change"
                      className="h-10 w-10 rounded object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-text-inverse transition group-hover:text-brand-primary">
                    Agenda for Change
                  </span>
                </div>
                <div className="group flex items-center gap-3">
                  <div className="flex-shrink-0 overflow-hidden rounded-lg bg-white/10 p-1.5 transition group-hover:bg-white/20">
                    <img
                      src={wateraidLogo}
                      alt="Water Aid"
                      className="h-10 w-10 rounded object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-text-inverse transition group-hover:text-brand-primary">
                    Water Aid
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group flex items-center gap-1.5 text-sm text-gray-300 transition hover:text-brand-primary"
                    >
                      <ChevronRight size={14} className="transition group-hover:translate-x-0.5" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Us */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                Contact Us
              </h3>
              <div className="space-y-3">
                <a
                  href="tel:01-4211693"
                  className="group flex items-center gap-3 text-sm text-gray-300 transition hover:text-brand-primary"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition group-hover:bg-brand-primary/20">
                    <Phone size={15} />
                  </div>
                  <span>01-4211693</span>
                </a>
                <a
                  href="tel:+9779851405021"
                  className="group flex items-center gap-3 text-sm text-gray-300 transition hover:text-brand-primary"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition group-hover:bg-brand-primary/20">
                    <Phone size={15} />
                  </div>
                  <span>+977 9851405021</span>
                </a>
                <a
                  href="mailto:info@nwash.gov.np"
                  className="group flex items-center gap-3 text-sm text-gray-300 transition hover:text-brand-primary"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition group-hover:bg-brand-primary/20">
                    <Mail size={15} />
                  </div>
                  <span>info@nwash.gov.np</span>
                </a>
                <div className="flex items-start gap-3 text-sm text-gray-300">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <MapPin size={15} />
                  </div>
                  <span>
                    Ministry of Water Supply & Sanitation, <br /> Singhadurbar, Kathmandu, Nepal
                  </span>
                </div>
              </div>
            </div>

            {/* Follow Us */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                Follow Us
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.youtube.com/@ministryofwatersupplyandsa4951"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-text-inverse transition hover:bg-red-600 hover:text-white"
                  title="YouTube"
                >
                  <Youtube size={20} />
                </a>
                <a
                  href="https://www.facebook.com/pages/Ministry%20of%20Water%20Supply%20and%20Sanitation/1621986998091285/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-text-inverse transition hover:bg-blue-600 hover:text-white"
                  title="Facebook"
                >
                  <Facebook size={20} />
                </a>
              </div>
              <p className="text-xs leading-relaxed text-gray-400">
                Stay connected with us on social media for the latest updates and announcements.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 px-6 py-5">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-xs text-gray-400 lg:flex-row lg:text-left">
            <p>
              &copy; {new Date().getFullYear()} Ministry of Water Supply & Sanitation. All rights
              reserved.
            </p>
            <p>
              Designed &amp; Developed by{" "}
              <a
                href="https://www.nwash.gov.np"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-primary transition hover:text-blue-300"
              >
                NWASH
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
