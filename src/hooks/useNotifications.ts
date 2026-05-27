import { useState, useEffect } from 'react';
import { NotificationItem } from '../components/layout/NotificationsDrawer';

export function useNotifications(isPeriodicPushEnabled: boolean, currentView: string) {
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);

  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>(() => {
    const cached = localStorage.getItem('engplus_notifications');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return parsed.map((item: any) => ({
          ...item,
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
        }));
      } catch (err) {
        console.error('Falha ao recuperar notificações do localStorage', err);
      }
    }
    return [
      {
        id: 'init-1',
        title: 'Boas-vindas ao Eng+!',
        description: 'Explore os canais acadêmicos e gerencie seus projetos com facilidade.',
        time: 'Ontem',
        read: true,
        category: 'general',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000)
      },
      {
        id: 'init-2',
        title: 'Aula Prática no Laboratório',
        description: 'O laboratório de fluidos está liberado para testes de viscosidade amanhã na sala 402 a partir das 14h.',
        time: '5h atrás',
        read: false,
        category: 'academic',
        timestamp: new Date(Date.now() - 5 * 3600 * 1000)
      },
      {
        id: 'init-1.5',
        title: 'Destaque: Coletivos Campus',
        description: 'Não esqueça de passar na nossa aba de Coletivos para marcar presença.',
        time: '6h atrás',
        read: false,
        category: 'general',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000)
      },
      {
        id: 'init-3',
        title: 'AeroDesign SAE • Novo Membro',
        description: 'Rodrigo Costa solicitou ingresso na equipe de aerodinâmica.',
        time: '1d atrás',
        read: false,
        category: 'project',
        timestamp: new Date(Date.now() - 25 * 3600 * 1000)
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('engplus_notifications', JSON.stringify(notificationsList));
  }, [notificationsList]);

  const triggerPushNotification = (title: string, description: string, category: NotificationItem['category']) => {
    const newNotif: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      description,
      time: 'Agora mesmo',
      read: false,
      category,
      timestamp: new Date()
    };
    setNotificationsList(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);

    // Auto clear toast after 4.5 seconds
    setTimeout(() => {
      setActiveToast(prev => prev?.id === newNotif.id ? null : prev);
    }, 4505);
  };

  const handleMarkAllAsRead = () => {
    setNotificationsList(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('engplus_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAll = () => {
    setNotificationsList([]);
    localStorage.setItem('engplus_notifications', JSON.stringify([]));
  };

  const handleToggleRead = (id: string) => {
    setNotificationsList(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: !n.read } : n);
      localStorage.setItem('engplus_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  // Background emitter that periodically fires simulated pushes if enabled
  useEffect(() => {
    if (!isPeriodicPushEnabled || currentView !== 'app') return;

    const pushSamples = [
      { title: 'Professor de Cálculo III', desc: 'Acaba de lançar as notas da P1 no SUAP. Média geral do curso de Engenharia foi 7.2.', cat: 'academic' },
      { title: 'Mensagem de Gabriel Silva', desc: '"Alguém tem o relatório de mecânica dos sólidos pronto para nos basearmos?"', cat: 'chat' },
      { title: 'Equipe de AeroDesign SAE', desc: 'Amanda Silveira editou o progresso do projeto "Baja SAE Aero" para 85%.', cat: 'project' },
      { title: 'Oportunidade de Voluntariado', desc: 'IFSP divulga novas vagas de iniciação científica para o segundo semestre de Engenharia.', cat: 'academic' },
      { title: 'Grupo de Estudos de Física II', desc: 'Sessão prática urgente agendada na biblioteca amanhã às 10:00.', cat: 'chat' },
      { title: 'Hackathon do Campus 2026', desc: 'Inscrições abertas para o Hackathon de IoT do Centro Acadêmico.', cat: 'general' }
    ] as const;

    const interval = setInterval(() => {
      const sample = pushSamples[Math.floor(Math.random() * pushSamples.length)];
      triggerPushNotification(sample.title, sample.desc, sample.cat);
    }, 32000); // 32 seconds timer

    return () => clearInterval(interval);
  }, [isPeriodicPushEnabled, currentView]);

  return {
    notificationsList,
    activeToast,
    setActiveToast,
    triggerPushNotification,
    handleMarkAllAsRead,
    handleClearAll,
    handleToggleRead
  };
}
