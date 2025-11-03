import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/")({
  component: HomePage,
});

function HeroSection() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden px-6 py-16 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h1
          className="text-balance font-bold text-4xl tracking-tight sm:text-5xl"
          id="hero-title"
        >
          Work Link — Team Collaboration, Simplified
        </h1>
        <p className="mt-6 text-pretty text-base text-muted-foreground leading-7">
          Lightweight, white-label team workspace with secure channels, user
          management, and real-time communication. Ready to deploy and easy to
          brand as your own.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            aria-label="Get started"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            to="/"
          >
            Get started
          </Link>
          <a
            className="inline-flex items-center rounded-md border border-border px-4 py-2 font-medium text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="#features"
          >
            See features
          </a>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features: Array<{ title: string; desc: string }> = [
    {
      title: "Default Admin account",
      desc: "Pre-configured admin to get you moving instantly.",
    },
    { title: "User management", desc: "Create unlimited users with ease." },
    { title: "Role-based access", desc: "Admin and Associate roles built-in." },
    {
      title: "Channels",
      desc: "Organize conversations with group chat channels.",
    },
    {
      title: "@Mentions + ringtone",
      desc: "Notify teammates and never miss a ping.",
    },
    {
      title: "Full chat history",
      desc: "New users can access past messages for context.",
    },
    {
      title: "Image & video",
      desc: "Share media seamlessly in conversations.",
    },
    { title: "Login tracking", desc: "Track logins and logouts for audits." },
    {
      title: "Usage reports",
      desc: "Daily/Monthly login-hours with CSV export.",
    },
    {
      title: "Docker build",
      desc: "Lightweight, production-ready containerized deploys.",
    },
    {
      title: "White-label",
      desc: "Customize logo, colors, and product name.",
    },
  ];

  return (
    <section
      aria-labelledby="features-title"
      className="px-6 py-12 lg:px-8"
      id="features"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="font-semibold text-2xl" id="features-title">
          Core features
        </h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <li className="rounded-lg border p-4 shadow-sm" key={f.title}>
              <h3 className="font-medium">{f.title}</h3>
              <p className="mt-1 text-muted-foreground text-sm">{f.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function NoteSection() {
  return (
    <section aria-labelledby="note-title" className="px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-semibold text-xl" id="note-title">
          Plan note
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">
          1:1 chat is not included in the base plan. Upgrade to a higher plan to
          enable direct messaging between users.
        </p>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section aria-labelledby="cta-title" className="px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-lg border p-6 text-center">
        <h2 className="font-semibold text-2xl" id="cta-title">
          Ready to get started?
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Spin up a Docker container and be live in minutes. Add your brand and
          invite your team when you’re ready.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <a
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/"
          >
            Deploy with Docker
          </a>
          <a
            className="inline-flex items-center rounded-md border border-border px-4 py-2 font-medium text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="#features"
          >
            Explore features
          </a>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <main className="container mx-auto w-full">
      <HeroSection />
      <FeaturesSection />
      <NoteSection />
      <CTASection />
    </main>
  );
}
