"use client";

// the contact section => the form on the left + resume card on the right
import { useRef, useState } from "react";
import { motion } from "motion/react";
import Footer from "./Footer";
import ResumeCard from "./ResumeCard";
import { setFluidTheme } from "../lib/fluidTheme";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useLineWipeReveal } from "../lib/useLineWipeReveal";

const columnVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

export default function ContactSection() {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const reduced = useReducedMotion();
  useLineWipeReveal(headingRef, reduced);

  // this holds the form stuff => email, subject, message
  const [form, setForm] = useState({
    email: "",
    subject: "",
    message: "",
  });

  // true while the email is flying => disables the button so no double sends
  const [isSending, setIsSending] = useState(false);

  // any input changes => update just that field by its name
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // hit send => throw the form at our api so it emails me
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to send");
      }

      alert("Message sent!");
      // wipe the form so it's fresh for the next message
      setForm({ email: "", subject: "", message: "" });
    } catch {
      alert("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.section
      id="contact"
      // scrolled here => switch the fluid bg to the warm contact colors
      onViewportEnter={() => setFluidTheme("contact")}
      viewport={{ once: false, amount: 0.3 }}
      className="relative z-30 flex min-h-screen flex-col justify-between overflow-hidden px-4 py-16 text-plate sm:px-6 sm:py-24 md:h-screen md:px-8 md:py-32"
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.15 }}
        className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 md:grid-cols-[0.9fr_1.1fr]"
      >
        <motion.div
          variants={columnVariants}
          className="pointer-events-auto relative z-40 mt-8 max-w-xl"
        >
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-lg sm:p-8">
            <h2 ref={headingRef} className="text-4xl font-bold sm:text-5xl">Contact</h2>

            <p className="mt-6 text-muted">
              Have a question or a project in mind? Feel free to reach out.
            </p>

            <form onSubmit={handleFormSubmit} className="pointer-events-auto">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleFormChange}
                className="mt-8 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-muted focus:border-white/40"
                required
              />

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleFormChange}
                className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-muted focus:border-white/40"
                required
              />

              <textarea
                name="message"
                placeholder="Message"
                value={form.message}
                onChange={handleFormChange}
                rows={6}
                className="mt-4 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-muted focus:border-white/40"
                required
              />

              <motion.button
                type="submit"
                disabled={isSending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full rounded-lg border border-white/10 bg-white/10 px-6 py-3 text-plate transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Submit"}
              </motion.button>
            </form>
          </div>
        </motion.div>

        <motion.div
          variants={columnVariants}
          className="pointer-events-auto relative z-40 md:mt-8"
        >
          <ResumeCard />
        </motion.div>
      </motion.div>

      <div className="pointer-events-auto relative z-40">
        <Footer />
      </div>
    </motion.section>
  );
}