import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function PodcastDetail() {
  const { id } = useParams();
  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const docRef = doc(db, "podcasts", id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setPodcast({ id: snapshot.id, ...snapshot.data() });
        } else {
          console.error("Podcast not found");
          setPodcast(null);
        }
      } catch (err) {
        console.error("Error fetching podcast:", err);
        setPodcast(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPodcast();
  }, [id]);

  if (loading) return <div>Loading podcast...</div>;
  if (!podcast) return <div>Podcast not found</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <img
        src={podcast.bannerUrl}
        alt={podcast.title}
        className="w-full h-60 object-cover rounded"
      />
      <h1 className="mt-4 text-2xl font-bold">{podcast.title}</h1>
      <p className="text-gray-700 mt-2">{podcast.description}</p>

      <div className="mt-4">
        <audio controls src={podcast.mp3Url} className="w-full">
          Your browser does not support the audio element.
        </audio>
      </div>

      <div className="mt-6">
        <Link to="/" className="text-blue-600">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
