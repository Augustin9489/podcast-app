import React, { useState } from 'react';
import { useAuth } from '../lib/Auth';
import { storage, rtdb } from '../lib/firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, push, set } from 'firebase/database';
import { motion } from 'framer-motion';
import { CloudArrowUpIcon, MusicalNoteIcon, PhotoIcon } from '@heroicons/react/24/solid';

export default function Upload() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState(null);
  const [cover, setCover] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white text-lg font-semibold">
        You must be logged in to upload.
      </div>
    );
  }

  const uploadFile = (path, file) => {
    return new Promise((resolve, reject) => {
      const fileRef = storageRef(storage, path);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(percent));
        },
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title || !file) return alert('Title and audio required');

    setUploading(true);
    setUploadSuccess(false);
    setProgress(0);

    try {
      const audioURL = await uploadFile(`podcasts/${Date.now()}-${file.name}`, file);
      let coverURL = '';
      if (cover) {
        coverURL = await uploadFile(`covers/${Date.now()}-${cover.name}`, cover);
      }

      const newPodcastRef = push(dbRef(rtdb, 'podcasts'));
      await set(newPodcastRef, {
        title,
        description: desc,
        audioURL,
        coverURL,
        createdBy: user.uid,
        createdAt: Date.now(),
        uploaderEmail: user.email || '',
      });

      setUploadSuccess(true);
      setTitle('');
      setDesc('');
      setFile(null);
      setCover(null);
    } catch (err) {
      console.error(err);
      alert('❌ Upload failed');
    }

    setUploading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl p-8 rounded-3xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl"
      >
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          🎙 Upload Episode
        </h2>

        {uploadSuccess && (
          <div className="p-4 mb-5 rounded-lg bg-green-500/20 border border-green-500 text-green-300">
            ✅ Your podcast has been uploaded successfully!
          </div>
        )}

        {uploading && (
          <div className="mb-5">
            <p className="text-sm text-gray-300 mb-1">
              {progress < 100 ? `Uploading: ${progress}%` : '✅ Upload Finished! Saving to database...'}
            </p>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-3 bg-gradient-to-r from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/50"
              />
            </div>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Episode title"
              className="w-full p-3 pl-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <MusicalNoteIcon className="w-6 h-6 absolute left-3 top-3 text-pink-400" />
          </div>

          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <div className="relative">
            <label className="flex items-center gap-3 cursor-pointer bg-white/10 p-3 rounded-lg border border-white/20 hover:bg-white/20 transition">
              <MusicalNoteIcon className="w-6 h-6 text-blue-400" />
              <span className="text-white">Select Audio File (MP3)</span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
          </div>

          <div className="relative">
            <label className="flex items-center gap-3 cursor-pointer bg-white/10 p-3 rounded-lg border border-white/20 hover:bg-white/20 transition">
              <PhotoIcon className="w-6 h-6 text-yellow-400" />
              <span className="text-white">Select Cover Image (optional)</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setCover(e.target.files[0])}
              />
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(236,72,153,0.6)' }}
            type="submit"
            disabled={uploading}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold tracking-wide disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : (
              <span className="flex items-center justify-center gap-2">
                <CloudArrowUpIcon className="w-6 h-6" /> Upload
              </span>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
