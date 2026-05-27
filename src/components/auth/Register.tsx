import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Calendar, Hash } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AppLogo } from '../ui/AppLogo';

interface RegisterProps {
  onNavigateLogin: () => void;
  onRegister: () => void;
}

export function Register({ onNavigateLogin, onRegister }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex flex-col items-center">
        <div className="mb-3">
          <AppLogo className="w-16 h-16" />
        </div>
        <h1 className="text-[22px] font-semibold text-slate-900 mt-2">Cadastro de aluno</h1>
      </div>

      <form className="w-full space-y-4" onSubmit={(e) => { e.preventDefault(); onRegister(); }}>
        <Input
          label="Nome Completo"
          placeholder="Ex: Rodrigo da Silva Oliveira"
          type="text"
          icon={User}
          required
        />

        <Input
          label="E-mail"
          placeholder="nome.dominio@gmail.com"
          type="email"
          icon={Mail}
          required
        />

        <Input
          label="Número de Matrícula"
          placeholder="0000000000000"
          type="text"
          icon={Hash}
          required
        />

        <Input
          label="Data de Nascimento"
          placeholder="DD/MM/YYYY"
          type="text"
          icon={Calendar}
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
          <Button type="submit" fullWidth>
            Criar conta
          </Button>
        </div>
      </form>

      <div className="mt-6 border-t border-slate-200 w-full pt-4 text-center">
        <p className="text-sm text-slate-600">
          Já possui uma conta?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="font-medium text-emerald-600 hover:text-emerald-500 hover:underline transition-colors"
          >
            Entre aqui!
          </button>
        </p>
      </div>
    </div>
  );
}
