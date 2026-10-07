"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSkillStore } from "@/store/useSkillStore";
import { Upload, User, Play } from "lucide-react";

export function OnboardingModal() {
  const isOnboarded = useSkillStore((state) => state.isOnboarded);
  const setUserData = useSkillStore((state) => state.setUserData);

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === "") return;
    setUserData(name, photo);
  };

  if (isOnboarded) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#1A2128] border border-white/10 p-6 md:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] w-[92%] max-w-md flex flex-col items-center"
        >
          <h2 className="text-3xl font-bold text-white mb-2 text-center">
            Bem-vindo(a) ao RoadMap IFMG!
          </h2>
          <p className="text-zinc-400 text-center mb-8">
            Personalize seu perfil para começar sua jornada.
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            {/* Foto Picker */}
            <div
              className="relative w-32 h-32 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer overflow-hidden group mb-6 transition-all hover:border-emerald-400/50"
              onClick={() => fileInputRef.current?.click()}
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-zinc-500 mb-2 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-xs text-zinc-500 font-medium text-center px-2 group-hover:text-emerald-400 transition-colors">
                    Foto (Opcional)
                  </span>
                </>
              )}
              {photo && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handlePhotoUpload}
            />

            {/* Nome Input */}
            <div className="w-full mb-8 relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Como quer ser chamado?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={name.trim() === ""}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-zinc-950 font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              Iniciar Jornada no IFMG
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
