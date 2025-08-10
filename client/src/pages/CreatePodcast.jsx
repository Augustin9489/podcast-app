import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";
import { useAuth } from "../lib/Auth";

export default function CreatePodcast() {
  const { user } = useAuth();
  const [mp3File, setMp3File] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!mp3File || !bannerFile) {
      alert("Please select both MP3 and banner image!");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Upload MP3
    const mp3Ref = ref(storage, `podcasts/${user.uid}/${mp3File.name}`);
    const mp3Task = uploadBytesResumable(mp3Ref, mp3File);

    mp3Task.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("MP3 upload failed:", error);
        setUploading(false);
      },
      async () => {
        const mp3URL = await getDownloadURL(mp3Task.snapshot.ref);

        // Upload Banner after MP3 finishes
        const bannerRef = ref(storage, `covers/${user.uid}/${bannerFile.name}`);
        const bannerTask = uploadBytesResumable(bannerRef, bannerFile);

        bannerTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Banner upload failed:", error);
            setUploading(false);
          },
          async () => {
            const bannerURL = await getDownloadURL(bannerTask.snapshot.ref);
            setUploading(false);
            alert(`Upload complete!\nMP3: ${mp3URL}\nBanner: ${bannerURL}`);
          }
        );
      }
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Create Podcast</h1>

      <input
        type="file"
        accept=".mp3"
        onChange={(e) => setMp3File(e.target.files[0])}
        className="mb-4"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setBannerFile(e.target.files[0])}
        className="mb-4"
      />

      {uploading && (
        <div className="mb-4">
          <p>Uploading: {Math.round(uploadProgress)}%</p>
          <div className="w-full bg-gray-200 h-2 rounded">
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-green-500 text-white rounded"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Podcast"}
      </button>
    </div>
  );
}
