import { Link } from "react-router-dom";
import {
  Youtube,
  Facebook,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
} from "lucide-react";
import a4cLogo from "../../assets/A4C.svg";
import wateraidLogo from "../../assets/wateraid.svg";
import weltwaterLogo from "../../assets/weltwater.svg";

const quickLinks = [
  { label: "Overview", to: "/overview" },
  { label: "Regulatory Roadmap", to: "/regulatory-roadmap" },
  { label: "Service Providers", to: "/service-providers" },
  { label: "GIS Map", to: "/gis-map" },
  { label: "Analytics", to: "/analytics" },
  { label: "Research", to: "/research" },
  { label: "Downloads", to: "/downloads" },
];

const supporters = [
  { src: a4cLogo, alt: "Agenda for Change" },
  { src: wateraidLogo, alt: "WaterAid" },
  { src: weltwaterLogo, alt: "Weltwater" },
];

const contactItems = [
  { href: "tel:+977-1-4311732", icon: Phone, label: "+977-1-4311732" },
  { href: "tel:+977-9851431060.", icon: Phone, label: "+977-9851431060" },
  {
    href: "mailto:nmip.nwash@gmail.com",
    icon: Mail,
    label: "nmip.nwash@gmail.com ",
  },
];

export default function Footer() {
  return (
    <footer>
      <div className="bg-[rgb(15,23,42)]">
        {/* Top accent line */}
        <div className="h-[3px] bg-gradient-to-r from-brand-primary via-blue-400 to-brand-primary" />

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          {/* ── Three-column grid ─────────────────────────────── */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {/* Quick Links */}
            <div>
              <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group flex items-center gap-1.5 py-0.5 text-sm text-slate-300 transition duration-150 hover:text-brand-primary"
                    >
                      <ChevronRight
                        size={13}
                        className="flex-shrink-0 text-slate-500 transition duration-150 group-hover:translate-x-0.5 group-hover:text-brand-primary"
                      />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Contact Us
              </h3>
              <div className="flex flex-col gap-3">
                {contactItems.map(({ href, icon: Icon, label }) => (
                  <a
                    key={href}
                    href={href}
                    className="group flex items-center gap-3 text-sm text-slate-300 transition duration-150 hover:text-brand-primary"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/8 ring-1 ring-white/10 transition duration-150 group-hover:bg-brand-primary/15 group-hover:ring-brand-primary/30">
                      <Icon size={14} />
                    </span>
                    <span>{label}</span>
                  </a>
                ))}
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/8 ring-1 ring-white/10">
                    <MapPin size={14} />
                  </span>
                  <span className="leading-relaxed">
                    Department of Water and Sewerage Management
                    <br />
                    Singhadurbar, Kathmandu, Nepal
                  </span>
                </div>
              </div>
            </div>

            {/* Follow Us */}
            <div>
              <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Follow Us
              </h3>
              <p className="mb-4 text-xs leading-relaxed text-slate-400">
                Stay updated with the latest news, policy changes, and
                announcements.
              </p>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.youtube.com/c/wateraidinnepal"
                  target="_blank"
                  rel="noreferrer"
                  title="YouTube"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/8 text-slate-300 ring-1 ring-white/10 transition duration-150 hover:bg-red-600 hover:text-white hover:ring-red-600"
                >
                  <Youtube size={17} />
                </a>
                <a
                  href="https://www.facebook.com/pages/Ministry%20of%20Water%20Supply%20and%20Sanitation/1621986998091285/"
                  target="_blank"
                  rel="noreferrer"
                  title="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/8 text-slate-300 ring-1 ring-white/10 transition duration-150 hover:bg-blue-600 hover:text-white hover:ring-blue-600"
                >
                  <Facebook size={17} />
                </a>
              </div>
            </div>
          </div>

          {/* ── Supported By — subtle horizontal strip ─────────── */}
          <div className="mt-10 pt-8">
            <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Supported By
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {supporters.map(({ src, alt }) => (
                <div
                  key={alt}
                  className="flex h-10 items-center justify-center rounded-md bg-white/90 px-4 opacity-70 transition duration-200 hover:opacity-100"
                >
                  <img
                    src={src}
                    alt={alt}
                    className="h-6 w-auto max-w-[100px] object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────────────────── */}
        <div className="border-t border-white/8">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <p className="text-center text-[11px] tracking-wide text-slate-500">
              National Water Supply &amp; Sanitation Regulatory Information
              System
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
