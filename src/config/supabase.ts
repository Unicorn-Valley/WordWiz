import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";

// Supabase 프로젝트 설정
// 환경변수는 .env 파일에서 관리됩니다

/**
 * Supabase 클라이언트 인스턴스
 * AsyncStorage를 사용하여 세션을 로컬에 저장합니다.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
