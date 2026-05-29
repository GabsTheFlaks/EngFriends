import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { AvatarPicker } from '../components/AvatarPicker';
import toast from 'react-hot-toast';
import { LogOut, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [username, setUsername] = useState('Usuário');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_index')
          .eq('id', user.id)
          .single();

        if (data) {
          const profileData = data as { username: string | null; avatar_index: number | null };
          setUsername(profileData.username || 'Usuário');
          setSelectedIndex(profileData.avatar_index || 0);
        }
      };

      fetchProfile();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_index: selectedIndex } as never)
      .eq('id', user.id);

    setIsSaving(false);

    if (error) {
      toast.error('Erro ao salvar avatar.');
    } else {
      toast.success('Avatar atualizado com sucesso!');
      navigate(-1); // Voltar para a aba anterior
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <div className="px-4 py-4 flex items-center justify-between border-b bg-white">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">Perfil</h1>
        <div className="w-10"></div> {/* Placeholder para alinhar ao centro */}
      </div>

      <div className="flex flex-col items-center mt-8 px-6">
        <div className="w-24 h-24 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center overflow-hidden mb-4 shadow-sm">
           <img src={`/avatars/avatar_${selectedIndex}.svg`} alt="Current Avatar" className="w-14 h-14" />
        </div>

        <h2 className="text-xl font-bold">{username}</h2>
        <p className="text-sm text-slate-500">{user?.email}</p>

        <div className="w-full mt-10 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-700">Escolha seu Avatar</h3>
          </div>
          <AvatarPicker selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
        </div>

        <div className="w-full mt-8 space-y-4">
          <Button fullWidth onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut size={18} />
            <span>Sair da conta</span>
          </button>
        </div>
      </div>
    </div>
  );
}
