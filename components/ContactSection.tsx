"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactIcon } from "./ContactIcon";

export function ContactSection() {
	return (
		<section
			id="contact"
			className="w-full py-16 pt-32 md:py-24 md:pt-36 px-4 md:px-8 bg-[#D9D5D2] relative z-0"
		>
			<div className="max-w-6xl mx-auto bg-[#ECEAE8] rounded-[40px] shadow-sm p-8 md:p-10 text-center">
				<div className="inline-block mx-auto mb-6">
					<ContactIcon />
				</div>
				<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold max-w-2xl mx-auto mb-6 sm:mb-8 text-[#2C2A25]">
					Tell me about your <span className="text-[#A2ABB1]">next</span>{" "}
					project
				</h2>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button
						asChild
						className="rounded-full bg-[#A2ABB1] text-white px-6 h-10 sm:h-12 border border-black/5 hover:bg-[#8A9AA3] transition-colors duration-300"
					>
						<a href="mailto:echo.zyr.2001@gmail.com">
							<Mail className="h-4 w-4" />
							<span>Email Me</span>
						</a>
					</Button>
					{/* WhatsApp button temporarily commented out
          <Button
            variant="outline"
            className="rounded-full h-10 sm:h-12 border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white transition-colors duration-300"
          >
            WhatsApp
          </Button>
          */}
				</div>
			</div>
		</section>
	);
}
