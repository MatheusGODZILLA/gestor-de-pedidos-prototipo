import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

const loginSchema = z.object({
  email: z.string().email('Endereço de email inválido'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'), 
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await axios.post(
        'http://localhost:3000/auth/login', 
        data, 
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Login response:', response.data);

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        login({
          id: response.data.sub,
          email: data.email,
        });

        navigate('/products');
      }
    } catch (error) {
      console.error('Login falhou:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
        alert(error.response.data.message || 'Email ou senha inválidos.');
      } else {
        alert('Erro ao fazer login. Tente novamente.');
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Senha</label>
          <input
            type="password"
            {...register('senha')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
          {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha.message}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Não tem uma conta?{' '}
        <Link to="/register" className="text-blue-500 hover:text-blue-600">
        Registre-se
        </Link>
      </p>
    </div>
  );
}
