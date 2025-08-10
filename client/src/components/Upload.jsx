import React, { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

export default function Upload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const storage = getStorage();
  const auth = getAuth();
  const db = getFirestore();

  const handleUpload = async () => {
    if (!audioFile) {
      alert("Please select an audio file");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Please log in first");
      return;
    }

    setLoading(true);

    try {
      // Upload audio file to /podcasts/{uid}/filename
      const audioRef = ref(storage, `podcasts/${user.uid}/${audioFile.name}`);
      await uploadBytes(audioRef, audioFile);
      const audioURL = await getDownloadURL(audioRef);

      // Upload cover image if provided
      let coverURL = "";
      if (coverImage) {
        const coverRef = ref(storage, `covers/${user.uid}/${coverImage.name}`);
        await uploadBytes(coverRef, coverImage);
        coverURL = await getDownloadURL(coverRef);
      }

      // Save metadata in Firestore
      await addDoc(collection(db, "episodes"), {
        title,
        description,
        audioURL,
        coverURL,
        createdBy: user.uid,
        createdAt: new Date()
      });

      alert("Upload successful!");
      setTitle("");
      setDescription("");
      setAudioFile(null);
      setCoverImage(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Upload Episode</h2>
      <input
        type="text"
        placeholder="Podcast Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Podcast Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div>
        <label>Audio file (MP3)</label>
        <input type="file" accept="audio/mpeg" onChange={(e) => setAudioFile(e.target.files[0])} />
      </div>
      <div>
        <label>Cover image (optional)</label>
        <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} />
      </div>
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
