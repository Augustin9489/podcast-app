// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { rtdb } from "../lib/firebase";
import { ref, onValue, push, set } from "firebase/database";
import { useAuth } from "../lib/Auth";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function Home() {
  const { user } = useAuth();
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize particles
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  useEffect(() => {
    const podcastsRef = ref(rtdb, "podcasts");

    const unsubscribe = onValue(podcastsRef, (snapshot) => {
      const data = snapshot.val();

      if (data && typeof data === "object") {
        const list = Object.entries(data)
          .map(([id, value]) => ({
            id,
            ...value,
          }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setPodcasts(list);
      } else {
        setPodcasts([]);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addToLibrary = async (podcast) => {
    if (!user) {
      alert("Please log in to save podcasts to your library.");
      return;
    }

    try {
      const libRef = push(ref(rtdb, `userLibraries/${user.uid}/podcasts`));
      await set(libRef, {
        ...podcast,
        savedAt: Date.now(),
      });
      alert("✅ Added to library!");
    } catch (error) {
      console.error("Error adding to library:", error);
      alert("❌ Failed to add to library");
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-gray-500 animate-pulse text-center">
        Loading podcasts...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Particle Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: "transparent" },
          fpsLimit: 60,
          particles: {
            number: { value: 50 },
            color: { value: ["#ff7eb3", "#ff758c", "#42a5f5", "#66bb6a"] },
            shape: { type: "circle" },
            opacity: { value: 0.5 },
            size: { value: { min: 2, max: 6 } },
            move: { enable: true, speed: 1, direction: "none", outModes: "out" },
            links: { enable: true, color: "#ccc", distance: 150, opacity: 0.3 },
          },
          interactivity: {
            events: { onHover: { enable: true, mode: "repulse" } },
            modes: { repulse: { distance: 100, duration: 0.4 } },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 -z-10"
      />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-4 relative z-10">
        <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent animate-gradient-x">
          🎙 All Podcasts
        </h1>

        {podcasts.length === 0 ? (
          <p className="text-gray-500 text-center italic">
            No podcasts uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {podcasts.map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="p-4 rounded-xl shadow-lg backdrop-blur-lg bg-white/40 border border-white/20 hover:shadow-2xl transition duration-300"
              >
                {p.coverURL && (
                  <motion.img
                    src={p.coverURL}
                    alt="cover"
                    className="w-full h-48 object-cover mb-3 rounded-lg shadow-md"
                    whileHover={{ scale: 1.05 }}
                  />
                )}

                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {p.title || "Untitled Podcast"}
                </h2>
                <p className="text-sm text-gray-700 mb-3">
                  {p.description || "No description"}
                </p>

                {p.audioURL && (
                  <div className="mt-2">
                    <audio
                      controls
                      className="w-full rounded-lg overflow-hidden bg-gray-200"
                    >
                      <source src={p.audioURL} type="audio/mpeg" />
                    </audio>
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-800 space-y-1">
                  <p>
                    <strong>Uploaded by:</strong>{" "}
                    <span className="text-indigo-600">
                      {p.createdBy || "Unknown"}
                    </span>
                  </p>
                  {p.createdAt && (
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(p.createdAt).toLocaleString()}
                    </p>
                  )}
                  {p.audioURL && (
                    <p>
                      <strong>Audio:</strong>{" "}
                      <a
                        href={p.audioURL}
                        className="text-blue-500 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    </p>
                  )}
                  {p.coverURL && (
                    <p>
                      <strong>Cover:</strong>{" "}
                      <a
                        href={p.coverURL}
                        className="text-blue-500 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    </p>
                  )}
                </div>

                {user && (
                  <motion.button
                    onClick={() => addToLibrary(p)}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 15px #22c55e" }}
                    className="mt-4 w-full px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg transition duration-200"
                  >
                    ➕ Add to Library
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
