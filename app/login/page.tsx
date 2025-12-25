'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from 'react-modal';

Modal.setAppElement('body');

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openModal = (
    title: string,
    message: string,
    type: 'success' | 'error'
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // ✅ IMPORTANTE
          body: JSON.stringify(form),
        }
      );

      if (res.ok) {
        const data = await res.json();
        openModal('Login exitoso', `Bienvenido ${data.user.name}`, 'success');
        router.push('/torneos');
      } else {
        const errorData = await res.json();
        openModal(
          'Error de autenticación',
          errorData.error || 'Credenciales inválidas',
          'error'
        );
      }
    } catch (err) {
      openModal('Error', 'Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-md mx-auto mt-10 p-6 border rounded-lg shadow'>
      <h1 className='text-2xl font-bold mb-4'>🔑 Iniciar Sesión</h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <input
          type='email'
          name='email'
          placeholder='Correo'
          value={form.email}
          onChange={handleChange}
          required
          className='w-full p-2 border rounded'
        />
        <input
          type='password'
          name='password'
          placeholder='Contraseña'
          value={form.password}
          onChange={handleChange}
          required
          className='w-full p-2 border rounded'
        />
        <button
          type='submit'
          disabled={loading}
          className='bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700'
        >
          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
      </form>
      {/* MODAL */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        closeTimeoutMS={200}
        className='relative bg-white rounded-2xl max-w-sm w-full mx-auto p-6 outline-none shadow-2xl animate-fadeIn'
        overlayClassName='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center'
      >
        {/* ICONO */}
        <div
          className={`w-16 h-16 mx-auto flex items-center justify-center rounded-full mb-4 ${
            modalType === 'success'
              ? 'bg-green-100 text-green-600'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {modalType === 'success' ? (
            <svg
              className='w-8 h-8'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M5 13l4 4L19 7'
              />
            </svg>
          ) : (
            <svg
              className='w-8 h-8'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          )}
        </div>

        {/* TITULO */}
        <h2 className='text-xl font-semibold text-center mb-2'>{modalTitle}</h2>

        {/* MENSAJE */}
        <p className='text-center text-gray-600 mb-6'>{modalMessage}</p>

        {/* BOTÓN */}
        <button
          onClick={closeModal}
          className={`w-full py-2.5 rounded-xl font-medium text-white transition ${
            modalType === 'success'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Entendido
        </button>
      </Modal>
    </div>
  );
}
