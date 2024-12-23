import { PushNotifications } from '@capacitor/push-notifications';

const registerNotifications = async () => {
  // Verificar permissões
  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  // Verificar se a permissão foi concedida
  if (permStatus.receive !== 'granted') {
    throw new Error('Permissão para receber notificações não concedida!');
  }

  // Registrar o dispositivo para receber notificações
  await PushNotifications.register();
};

const addListeners = async () => {
  // Ouvir o evento de sucesso do registro de notificações
  await PushNotifications.addListener('registration', (token) => {
    console.log('Token de registro: ', token.value);
  });

  // Ouvir o evento de erro no registro
  await PushNotifications.addListener('registrationError', (err) => {
    console.error('Erro ao registrar: ', err.error);
  });

  // Ouvir quando uma notificação é recebida
  await PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Notificação recebida: ', notification);
  });

  // Ouvir quando uma ação for realizada em uma notificação
  await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Ação realizada na notificação: ', notification.actionId, notification.inputValue);
  });
};

const createNotificationChannel = async () => {
  await PushNotifications.createChannel({
    id: 'default',
    name: 'Default Channel',
    description: 'Canal padrão para notificações',
    importance: 5, // 5 é alta prioridade
  });
};

// Chamar as funções de inicialização
addListeners();
registerNotifications();
createNotificationChannel();