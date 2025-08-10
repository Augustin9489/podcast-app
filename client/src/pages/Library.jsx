// src/pages/Library.jsx
import React, { useEffect, useState } from "react";
import { rtdb } from "../lib/firebase";
import { ref, onValue, remove } from "firebase/database";
import { useAuth } from "../lib/Auth";
import { MusicalNoteIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function Library() {
  const { user } = useAuth();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const libRef = ref(rtdb, `userLibraries/${user.uid}/podcasts`);
    const unsubscribe = onValue(libRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setLibrary(list);
      } else {
        setLibrary([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const removeFromLibrary = async (id) => {
    if (!user) return;
    await remove(ref(rtdb, `userLibraries/${user.uid}/podcasts/${id}`));
  };

  if (!user)
    return (
      <div className="p-6 text-center text-gray-600">
        Please login to view your library.
      </div>
    );

  if (loading)
    return (
      <div className="p-6 text-center text-purple-600 font-semibold">
        Loading your library...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
        🎵 My Library
      </h1>

      {library.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <MusicalNoteIcon className="h-16 w-16 text-purple-400 mb-4" />
          <p className="text-lg">Your library is empty. Start adding podcasts!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {library.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden transform hover:scale-[1.02]"
            >
              {p.coverURL && (
                <img
                  src={p.coverURL}
                  alt="cover"
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                  {p.title}
                </h2>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {p.description}
                </p>

                {p.audioURL && (
                  <audio
                    controls
                    className="w-full mt-3 rounded-lg border border-gray-200"
                  >
                    <source src={p.audioURL} type="audio/mpeg" />
                  </audio>
                )}

                <button
                  onClick={() => removeFromLibrary(p.id)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
