-- notifications 테이블 생성
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notification_type TEXT NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at);

-- RLS 활성화
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- SELECT 정책: 사용자는 자신의 알림만 조회 가능
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (user_id = auth.uid());

-- INSERT 정책: 사용자는 자신의 알림만 생성 가능
CREATE POLICY "Users can create their own notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- UPDATE 정책: 사용자는 자신의 알림만 수정 가능
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- DELETE 정책: 사용자는 자신의 알림만 삭제 가능
CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (user_id = auth.uid());
