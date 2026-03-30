export default function Footer() {
  const links = [
    "Audio Description", "Help Center", "Gift Cards", "Media Center",
    "Investor Relations", "Jobs", "Terms of Use", "Privacy",
    "Legal Notices", "Cookie Preferences", "Corporate Information", "Contact Us",
  ];

  return (
    <footer className="px-4 md:px-14 py-10 mt-12 text-[#808080]">
      <div className="max-w-[980px] mx-auto">
        <p className="text-sm mb-6">
          Questions? Call{" "}
          <span className="hover:underline cursor-pointer">1-844-505-2993</span>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[13px]">
          {links.map((link) => (
            <span
              key={link}
              className="hover:underline cursor-pointer"
            >
              {link}
            </span>
          ))}
        </div>
        <p className="text-xs mt-8">&copy; 1997-2026 Netflix Clone, Inc.</p>
      </div>
    </footer>
  );
}
