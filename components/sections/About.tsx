import { SectionHeader } from "@/components/SectionHeader";
import { Card } from "@/components/Card";
import { Code, Globe } from "lucide-react";

export function About() {
  const skills = [
    {
      name: "Frontend Development",
      icon: <Code className="size-6" />,
      description: "Expert in React, Next.js, and modern CSS",
    },
    {
      name: "International Experience",
      icon: <Globe className="size-6" />,
      description:
        "Worked with clients across different countries and industries",
    },
  ];

  return (
    <div id="about" className="py-16 lg:py-24">
      <div className="container">
        <SectionHeader
          title="About Me"
          eyebrow="My Background"
          description="A passionate developer focused on creating exceptional web experiences"
        />

        <div className="mt-10 md:mt-20">
          <Card className="px-8 py-8 md:px-10 lg:px-20">
            <div className="flex flex-col gap-8 lg:gap-16">
              <p className="text-white/60 md:text-lg">
                I&apos;m a frontend developer with 5+ years of experience
                building modern web applications. My journey began with HTML,
                CSS, and vanilla JavaScript, and has evolved to embrace modern
                frameworks and tools like React, Next.js, and TypeScript.
                I&apos;m passionate about creating accessible, performant, and
                beautiful web experiences.
              </p>

              <div>
                <h3 className="font-serif text-2xl mb-6">My Skills</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="bg-white/10 p-6 rounded-xl"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {skill.icon}
                        <h4 className="font-semibold">{skill.name}</h4>
                      </div>
                      <p className="text-white/60">{skill.description}</p>
                    </div>
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
