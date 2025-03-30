import Image from "next/image";
import { ArrowRight, Mail, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#D9D5D2] flex flex-col">
      {/* 导航栏 */}
      <header className="w-full py-6 px-8 flex justify-between items-center bg-[#D9D5D2]">
        <div className="flex items-center">
          <svg
            width="48"
            height="24"
            viewBox="0 0 48 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="12" fill="#2C2A25" />
            <path
              d="M24 0C30.6274 0 36 5.37258 36 12C36 18.6274 30.6274 24 24 24V0Z"
              fill="#2C2A25"
            />
            <path
              d="M36 0C42.6274 0 48 5.37258 48 12C48 18.6274 42.6274 24 36 24V0Z"
              fill="#2C2A25"
            />
          </svg>
        </div>
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-[#2C2A25] hover:text-gray-600">
            Home
          </a>
          <a href="#about" className="text-[#2C2A25] hover:text-gray-600">
            About
          </a>
          <a href="#portfolio" className="text-[#2C2A25] hover:text-gray-600">
            Portfolio
          </a>
          <a href="#exhibitions" className="text-[#2C2A25] hover:text-gray-600">
            Exhibitions
          </a>
          <a href="#contact" className="text-[#2C2A25] hover:text-gray-600">
            Contact
          </a>
        </nav>
        <div className="flex items-center">
          <span className="text-sm mr-2 text-[#2C2A25]">
            Sam Cano, 22 Nov 23
          </span>
          <div className="w-8 h-8 rounded-full bg-[#A2ABB1] flex items-center justify-center">
            <span className="text-white text-xs">SC</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 英雄区域 */}
        <section className="w-full px-4 py-16 md:py-24 md:px-8 bg-[#D9D5D2]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col justify-center">
              <h1 className="text-6xl md:text-8xl font-bold leading-none mb-6 text-[#2C2A25]">
                visual
                <br />
                poetry
              </h1>
              <p className="text-lg max-w-md mb-8 text-[#2C2A25]">
                Welcome to a visual journey that transcends time and space.
                Discover the artistry of moments captured in motion.
              </p>

              <div className="flex space-x-4 mb-12">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#ECEAE8] flex items-center justify-center"
                >
                  <span className="text-xs text-[#2C2A25]">IG</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#ECEAE8] flex items-center justify-center"
                >
                  <span className="text-xs text-[#2C2A25]">FB</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#ECEAE8] flex items-center justify-center"
                >
                  <span className="text-xs text-[#2C2A25]">TW</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#ECEAE8] flex items-center justify-center"
                >
                  <span className="text-xs text-[#2C2A25]">YT</span>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-3xl font-bold mb-2 text-[#2C2A25]">
                    +250k
                  </h3>
                  <p className="text-sm text-gray-600">
                    Views that reaching a wide audience and giving inspiration
                  </p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-2 text-[#2C2A25]">
                    +800k
                  </h3>
                  <p className="text-sm text-gray-600">
                    Hours watched, engaging storytelling that captivates viewers
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-[#A2ABB1] rounded-3xl overflow-hidden h-[500px] relative">
                <Image
                  src="/placeholder.svg?height=500&width=400"
                  alt="Photographer with camera"
                  width={400}
                  height={500}
                  className="object-cover h-full w-full"
                />
              </div>
              <div className="absolute top-4 right-4 bg-[#2C2A25] rounded-full p-2">
                <Globe className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </section>

        {/* 过渡区域 - 添加大圆角 */}
        <div className="section-transitio bg-[#333333] h-32 relative">
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#D9D5D2] rounded-b-[100px]"></div>
        </div>

        {/* 关于区域 - 更改为深灰色 */}
        <section
          id="about"
          className="w-full bg-[#333333] text-white py-16 md:py-24 px-4 md:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="overflow-hidden mb-16">
              <h2 className="text-6xl md:text-8xl font-bold whitespace-nowrap">
                about · about · about · about
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative h-[500px] flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[400px] h-[400px] relative">
                    {/* 放射状的白色手形状 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-full h-full bg-contain bg-center bg-no-repeat"
                        style={{
                          backgroundImage:
                            "url('/placeholder.svg?height=400&width=400')",
                        }}
                      ></div>
                    </div>

                    {/* 中心的人物 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src="/placeholder.svg?height=300&width=200"
                        alt="Photographer with camera"
                        width={200}
                        height={300}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* 装饰性十字准线 */}
                <div className="absolute top-4 left-4 w-8 h-8 border border-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 border-t border-l border-white"></div>
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 border border-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 border-t border-r border-white"></div>
                </div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border border-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 border-b border-l border-white"></div>
                </div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border border-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 border-b border-r border-white"></div>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-bold mb-6">
                  The Art of Visual Storytelling
                </h3>
                <p className="text-lg mb-6">
                  With over a decade of experience capturing moments that
                  matter, I've developed a unique perspective that blends
                  technical precision with artistic vision.
                </p>
                <p className="text-lg mb-8">
                  My work explores the intersection of light, emotion, and
                  narrative, creating visual poetry that resonates with viewers
                  on a profound level.
                </p>
                <Button
                  variant="outline"
                  className="rounded-full bg-transparent text-white border-white hover:bg-white hover:text-[#333333] px-6 h-12"
                >
                  <span>Learn More</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 过渡区域 - 添加大圆角 */}
        <div className="section-transition bg-[#D9D5D2] h-32 relative">
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#333333] rounded-b-[100px]"></div>
        </div>

        {/* 作品集区域 */}
        <section
          id="portfolio"
          className="w-full py-16 md:py-24 px-4 md:px-8 bg-[#D9D5D2]"
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-6xl md:text-8xl font-bold mb-16 text-[#2C2A25]">
              portfolio
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-2 bg-[#ECEAE8] rounded-3xl p-8 h-[400px] relative">
                <Image
                  src="/placeholder.svg?height=300&width=300"
                  alt="Minimalist tree"
                  width={300}
                  height={300}
                  className="absolute bottom-8 left-8"
                />
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="London Eye"
                  width={200}
                  height={200}
                  className="absolute bottom-8 right-8"
                />
              </div>

              <div className="bg-[#A2ABB1] rounded-3xl p-8 h-[400px] flex items-end">
                <Image
                  src="/placeholder.svg?height=300&width=200"
                  alt="Yellow palm leaf"
                  width={200}
                  height={300}
                  className="object-contain"
                />
              </div>
            </div>

            <div className="mt-12 flex justify-center">
              <Button
                variant="default"
                className="rounded-full bg-[#A2ABB1] text-white px-8 h-12"
              >
                <span>View All Projects</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* 展览区域 */}
        <section
          id="exhibitions"
          className="w-full py-16 md:py-24 px-4 md:px-8 bg-[#D9D5D2]"
        >
          <div className="max-w-7xl mx-auto">
            <div className="overflow-hidden mb-16">
              <h2 className="text-6xl md:text-8xl font-bold whitespace-nowrap text-[#2C2A25]">
                exhibitions · exhibitions
              </h2>
            </div>

            <div className="space-y-8">
              <div className="border-t border-gray-200 py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-1 text-xl font-bold text-[#2C2A25]">
                  01
                </div>
                <div className="md:col-span-4">
                  <h3 className="text-2xl font-bold text-[#2C2A25]">
                    Cinematic Visions Unveiled
                  </h3>
                </div>
                <div className="md:col-span-4 text-gray-600">
                  Madrid Gallery, Spain, 21 Nov 2023
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <Button
                    variant="outline"
                    className="rounded-full border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white"
                  >
                    Buy Ticket
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-200 py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-1 text-xl font-bold text-[#2C2A25]">
                  02
                </div>
                <div className="md:col-span-4">
                  <h3 className="text-2xl font-bold text-[#2C2A25]">
                    Frames in Motion
                  </h3>
                </div>
                <div className="md:col-span-4 text-gray-600">
                  Manchester Museum, UK, 20 Nov 2023
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <Button
                    variant="outline"
                    className="rounded-full border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white"
                  >
                    Buy Ticket
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-200 py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-1 text-xl font-bold text-[#2C2A25]">
                  03
                </div>
                <div className="md:col-span-4">
                  <h3 className="text-2xl font-bold text-[#2C2A25]">
                    Journey Through Time
                  </h3>
                </div>
                <div className="md:col-span-4 text-gray-600">
                  Milan Gallery, Italy, 19 Nov 2023
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <Button
                    variant="outline"
                    className="rounded-full border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white"
                  >
                    Buy Ticket
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-200 py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-1 text-xl font-bold text-[#2C2A25]">
                  04
                </div>
                <div className="md:col-span-4">
                  <h3 className="text-2xl font-bold text-[#2C2A25]">
                    Experimental Narratives
                  </h3>
                </div>
                <div className="md:col-span-4 text-gray-600">
                  Paris Museum, France, 18 Nov 2023
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <Button
                    variant="outline"
                    className="rounded-full border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white"
                  >
                    Buy Ticket
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 联系区域 */}
        <section
          id="contact"
          className="w-full py-16 md:py-24 px-4 md:px-8 bg-[#D9D5D2]"
        >
          <div className="max-w-6xl mx-auto bg-[#ECEAE8] rounded-[40px] shadow-sm p-10 text-center">
            <div className="inline-block mx-auto mb-6">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M36 20C36 14.4772 31.5228 10 26 10C20.4772 10 16 14.4772 16 20C16 25.5228 20.4772 30 26 30"
                  stroke="#2C2A25"
                  strokeWidth="2"
                />
                <path
                  d="M22 30C22 35.5228 17.5228 40 12 40C6.47715 40 2 35.5228 2 30C2 24.4772 6.47715 20 12 20"
                  stroke="#2C2A25"
                  strokeWidth="2"
                />
                <path d="M16 24H36" stroke="#2C2A25" strokeWidth="2" />
                <path d="M32 20L36 24L32 28" stroke="#2C2A25" strokeWidth="2" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold max-w-2xl mx-auto mb-8 text-[#2C2A25]">
              Tell me about your <span className="text-[#A2ABB1]">next</span>{" "}
              project
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="rounded-full bg-[#A2ABB1] text-white px-6 h-12">
                <Mail className="mr-2 h-4 w-4" />
                <span>Email Me</span>
              </Button>
              <Button
                variant="outline"
                className="rounded-full h-12 border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white"
              >
                WhatsApp
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="w-full py-8 px-8 bg-[#D9D5D2]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <svg
              width="48"
              height="24"
              viewBox="0 0 48 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="12" fill="#2C2A25" />
              <path
                d="M24 0C30.6274 0 36 5.37258 36 12C36 18.6274 30.6274 24 24 24V0Z"
                fill="#2C2A25"
              />
              <path
                d="M36 0C42.6274 0 48 5.37258 48 12C48 18.6274 42.6274 24 36 24V0Z"
                fill="#2C2A25"
              />
            </svg>
          </div>

          <nav className="flex space-x-8 mb-4 md:mb-0">
            <a href="#" className="text-[#2C2A25] hover:text-gray-600 text-sm">
              Home
            </a>
            <a
              href="#about"
              className="text-[#2C2A25] hover:text-gray-600 text-sm"
            >
              About
            </a>
            <a
              href="#portfolio"
              className="text-[#2C2A25] hover:text-gray-600 text-sm"
            >
              Portfolio
            </a>
            <a
              href="#exhibitions"
              className="text-[#2C2A25] hover:text-gray-600 text-sm"
            >
              Exhibitions
            </a>
            <a
              href="#contact"
              className="text-[#2C2A25] hover:text-gray-600 text-sm"
            >
              Contact
            </a>
          </nav>

          <div className="text-sm text-gray-500">
            © 2024 All rights reserved.
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8">
          <h2 className="text-6xl md:text-8xl font-bold opacity-20 text-[#2C2A25]">
            vidéaste
          </h2>
        </div>
      </footer>
    </div>
  );
}
