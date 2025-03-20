import { SectionHeader } from "@/components/SectionHeader";
import { Card } from "@/components/Card";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";

export function Contact() {
  const contactMethods = [
    {
      name: "Email",
      icon: <Mail className="size-6" />,
      link: "mailto:your.email@example.com",
      label: "your.email@example.com",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="size-6" />,
      link: "https://linkedin.com/in/yourusername",
      label: "linkedin.com/in/yourusername",
    },
    {
      name: "GitHub",
      icon: <Github className="size-6" />,
      link: "https://github.com/yourusername",
      label: "github.com/yourusername",
    },
    {
      name: "Twitter",
      icon: <Twitter className="size-6" />,
      link: "https://twitter.com/yourusername",
      label: "@yourusername",
    },
  ];

  return (
    <div id="contact" className="py-16 lg:py-24">
      <div className="container">
        <SectionHeader
          title="Let's Connect"
          eyebrow="Contact Me"
          description="Interested in working together? Reach out through any of these platforms."
        />

        <div className="mt-10 md:mt-20">
          <Card className="px-8 py-8 md:px-10 lg:px-20">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-serif text-2xl mb-6">Get In Touch</h3>
                <p className="text-white/60 md:text-lg">
                  I&lsquo;m currently available for freelance work and full-time
                  positions. If you have a project that needs a developer who
                  cares about both code quality and user experience, let&lsquo;s
                  talk!
                </p>
              </div>

              <div>
                <h3 className="font-serif text-2xl mb-6">Connect With Me</h3>
                <div className="flex flex-col gap-4">
                  {contactMethods.map((method) => (
                    <a
                      key={method.name}
                      href={method.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-white/70 hover:text-white transition-colors p-3 rounded-lg hover:bg-white/10"
                    >
                      {method.icon}
                      <span>{method.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
