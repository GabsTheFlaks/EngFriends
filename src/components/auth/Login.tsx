import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AppLogo } from '../ui/AppLogo';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Login bem-sucedido!');
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex flex-col items-center">
        <div className="mb-3">
          <AppLogo className="w-16 h-16" />
        </div>
        <h1 className="text-[22px] font-semibold text-slate-900 mt-2">Acesse sua conta</h1>
      </div>

      <form className="w-full space-y-5" onSubmit={handleLogin}>
        <Input
          label="E-mail"
          placeholder="nome.dominio@gmail.com"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Senha"
          placeholder="Coloque a senha da sua conta"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
          required
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-eng-blue focus:ring-eng-blue cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 cursor-pointer select-none">
            Lembrar de mim neste dispositivo
          </label>
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth className="group" disabled={isLoading}>
            <span>{isLoading ? 'Entrando...' : 'Entrar'}</span>
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
          </Button>
        </div>
      </form>

      <div className="mt-8 border-t border-slate-200 w-full pt-6 text-center">
        <p className="text-sm text-slate-600">
          Ainda não tem conta?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="font-medium text-emerald-600 hover:text-emerald-500 hover:underline transition-colors"
          >
            Cadastre-se aqui!
          </button>
        </p>
      </div>
    </div>
  );
}
