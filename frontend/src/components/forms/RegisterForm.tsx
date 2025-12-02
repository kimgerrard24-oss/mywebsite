// frontend/components/forms/RegisterForm.tsx

import { useState } from 'react';
import { registerUser } from '@/lib/api/auth';

export default function RegisterForm() {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await registerUser(form);
      setMessage(res.message);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span>Email</span>
        <input
          required
          type="email"
          className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>

      <label className="block">
        <span>Username</span>
        <input
          required
          className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
      </label>

      <label className="block">
        <span>Password</span>
        <input
          required
          type="password"
          className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </label>

      <button
        type="submit"
        className="w-full p-2 bg-blue-600 text-white rounded"
      >
        Register
      </button>

      {message && <p className="text-green-600">{message}</p>}
    </form>
  );
}
