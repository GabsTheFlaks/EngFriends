import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Calendar, Hash } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AppLogo } from '../ui/AppLogo';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Cadastro realizado! Verifique seu email ou faça login.');
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex flex-col items-center">
        <div className="mb-3">
          <AppLogo className="w-16 h-16" />
        </div>
        <h1 className="text-[22px] font-semibold text-slate-900 mt-2">Cadastro de aluno</h1>
      </div>

      <form className="w-full space-y-4" onSubmit={handleRegister}>
        <Input
          label="Username"
          placeholder="Ex: rodrigosilva"
          type="text"
          icon={User}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

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

        <Input
          label="Confirmar senha"
          placeholder="Repita a senha colocada acima"
          type={showConfirmPassword ? 'text' : 'password'}
          icon={Lock}
          required
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="focus:outline-none hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <div className="pt-4">
          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? 'Criando...' : 'Criar conta'}
          </Button>
        </div>
      </form>

      <div className="mt-6 border-t border-slate-200 w-full pt-4 text-center">
        <p className="text-sm text-slate-600">
          Já possui uma conta?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-medium text-emerald-600 hover:text-emerald-500 hover:underline transition-colors"
          >
            Entre aqui!
          </button>
        </p>
      </div>
    </div>
  );
}
