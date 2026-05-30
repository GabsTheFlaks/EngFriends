import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AppLogo } from '../components/ui/AppLogo';
import { AuthLayout } from '../components/auth/AuthLayout';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loadingState, setLoadingState] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoadingState(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Immediately upsert default profile record
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              username: username,
              avatar_index: 0,
              ra: '2026.0000.01',
              course: 'Engenharia de Software',
              period: '1º Período • Integral'
            });
          if (profileError) console.error('Erro ao salvar perfil inicial:', profileError);
        }

        setSuccessMsg('Cadastro realizado com sucesso! Faça login abaixo.');
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        // Ensure user has profile record in profiles table
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (!profile) {
            await supabase.from('profiles').insert({
              id: data.user.id,
              username: data.user.user_metadata.username || email.split('@')[0],
              avatar_index: 0,
              ra: '2026.0000.01',
              course: 'Engenharia de Software',
              period: '1º Período • Integral'
            });
          }
        }

        toast.success('Login efetuado com sucesso!');
      }
    } catch (err) {
      console.error(err);
      let friendlyMessage = err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
      if (friendlyMessage.includes('already registered') || friendlyMessage.includes('already exists')) {
        friendlyMessage = 'Este e-mail já está cadastrado.';
      } else if (friendlyMessage.includes('Invalid login credentials')) {
        friendlyMessage = 'E-mail ou senha incorretos.';
      } else if (friendlyMessage.includes('Password should be')) {
        friendlyMessage = 'A senha deve ter pelo menos 6 caracteres.';
      }
      setErrorMsg(friendlyMessage);
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 hover:scale-105 transition-transform duration-300">
            <AppLogo className="w-28 h-28" />
          </div>
          <h1 className="text-[22px] font-semibold text-slate-900 mt-2">
            {isSignUp ? 'Cadastro de aluno' : 'Acesse sua conta'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isSignUp ? 'Preencha seus dados para criar sua conta' : 'Conecte-se com alunos de engenharia'}
          </p>
        </div>

        {errorMsg && (
          <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 animate-fade-in">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span className="text-xs font-semibold">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="w-full mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-emerald-700 animate-fade-in">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-emerald-600" />
            <span className="text-xs font-semibold">{successMsg}</span>
          </div>
        )}

        <form className="w-full space-y-4" onSubmit={handleAuthSubmit}>
          {isSignUp && (
            <Input
              label="Nome de Usuário"
              placeholder="Ex: AmandaS"
              type="text"
              icon={User}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}

          <Input
            label="E-mail"
            placeholder="seu.email@exemplo.com"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Senha"
            placeholder="Digite sua senha"
            type={showPassword ? 'text' : 'password'}
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none hover:text-slate-655 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          {isSignUp && (
            <Input
              label="Confirmar Senha"
              placeholder="Repita a senha"
              type={showConfirmPassword ? 'text' : 'password'}
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none hover:text-slate-655 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          )}

          {!isSignUp && (
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-eng-blue focus:ring-eng-blue cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-700 cursor-pointer select-none">
                Lembrar de mim neste dispositivo
              </label>
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" fullWidth disabled={loadingState} className="group">
              {loadingState ? (
                <span>Aguarde...</span>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <span>{isSignUp ? 'Criar conta' : 'Entrar'}</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-8 border-t border-slate-200 w-full pt-6 text-center">
          <p className="text-xs text-slate-600">
            {isSignUp ? 'Já possui uma conta?' : 'Ainda não tem conta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="font-bold text-emerald-650 hover:text-emerald-500 hover:underline transition-colors cursor-pointer"
            >
              {isSignUp ? 'Entre aqui!' : 'Cadastre-se aqui!'}
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
