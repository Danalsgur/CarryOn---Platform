import { supabase } from '../supabase';

export type NotificationType = 'new_carrier_application' | 'match_confirmed';

// 알림 생성 함수
export const createNotification = async (
  userId: string, 
  title: string, 
  message: string, 
  link: string,
  notificationType: NotificationType
) => {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      link,
      notification_type: notificationType
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('알림 생성 실패:', error);
    return false;
  }
};

// 알림 조회 함수
export const getNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('알림 조회 실패:', error);
    return [];
  }
};

// 읽지 않은 알림 수 조회 함수
export const getUnreadNotificationsCount = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('읽지 않은 알림 수 조회 실패:', error);
    return 0;
  }
};

// 알림 읽음 처리 함수
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
    return false;
  }
};

// 모든 알림 읽음 처리 함수
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('모든 알림 읽음 처리 실패:', error);
    return false;
  }
};
