"use client";

import { useState } from "react";
import Footer from "./Footer";
import ResumeCard from "./ResumeCard";

export default function ContactSection() {
  const [form, setForm] = useState({
    email: "",
    subject: "",
    message: "",
  });

  const [isSending, setIsSending] = useState(false);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
      setForm({ email: "", subject: "", message: "" });
    } catch {
      alert("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative z-30 flex h-screen flex-col justify-between overflow-hidden px-8 py-28 text-white"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 md:grid-cols-[0.9fr_1.1fr]">
        <div className="pointer-events-auto relative z-40 mt-10 max-w-xl">
          <div className="rounded-3xl border border-white/10 bg-black/40 p-8 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-lg">
            <h2 className="text-5xl font-bold">Contact</h2>

            <p className="mt-6 text-gray-300">
              Have a question or a project in mind? Feel free to reach out.
            </p>

            <form onSubmit={handleFormSubmit} className="pointer-events-auto">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleFormChange}
                className="mt-8 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-gray-400 focus:border-white/40"
                required
              />

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleFormChange}
                className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-gray-400 focus:border-white/40"
                required
              />

              <textarea
                name="message"
                placeholder="Message"
                value={form.message}
                onChange={handleFormChange}
                rows={6}
                className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-gray-400 focus:border-white/40"
                required
              />

              <button
                type="submit"
                disabled={isSending}
                className="mt-4 w-full rounded-xl border border-white/10 bg-white/10 px-6 py-3 text-gray-200 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Submit"}
              </button>
            </form>
          </div>
        </div>

        <div className="pointer-events-auto relative z-40 mt-10 hidden md:block">
          <ResumeCard />
        </div>
      </div>

      <div className="pointer-events-auto relative z-40">
        <Footer />
      </div>
    </section>
  );
}