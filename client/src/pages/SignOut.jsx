import React, { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function SignOut() {
  const navigate = useNavigate();

  useEffect(() => {
    signOut(auth)
      .then(() => navigate('/'))
      .catch(err => console.error('Sign out error:', err));
  }, [navigate]);

  return <p>Signing you out...</p>;
}
import React, { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function SignOut() {
  const navigate = useNavigate();

  useEffect(() => {
    signOut(auth)
      .then(() => navigate('/'))
      .catch(err => console.error('Sign out error:', err));
  }, [navigate]);

  return <p>Signing you out...</p>;
}
