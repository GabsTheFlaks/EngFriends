import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AppLogo } from '../ui/AppLogo';

interface LoginProps {
  onNavigateRegister: () => void;
  onLogin: () => void;
}

export function Login({ onNavigateRegister, onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Por favor, informe um e-mail válido com '@' e um domínio.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex flex-col items-center">
        <div className="mb-3">
          <AppLogo className="w-16 h-16" />
        </div>
        <h1 className="text-[22px] font-semibold text-slate-900 mt-2">Acesse sua conta</h1>
      </div>

      <form className="w-full space-y-5" onSubmit={handleSubmit}>
        <Input
          label="E-mail"
          name="email"
          placeholder="nome.dominio@gmail.com"
          type="email"
          icon={Mail}
          required
        />

        <Input
          label="Senha"
          placeholder="Coloque a senha da sua conta"
          type={showPassword ? 'text' : 'password'}
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
          <Button type="submit" fullWidth disabled={isLoading} className={`group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            <span>{isLoading ? 'Processando...' : 'Entrar'}</span>
            {!isLoading && <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>}
          </Button>
        </div>
      </form>

      <div className="mt-8 border-t border-slate-200 w-full pt-6 text-center">
        <p className="text-sm text-slate-600">
          Ainda não tem conta?{' '}
          <button
            type="button"
            onClick={onNavigateRegister}
            className="font-medium text-emerald-600 hover:text-emerald-500 hover:underline transition-colors"
          >
            Cadastre-se aqui!
          </button>
        </p>
      </div>
    </div>
  );
}
