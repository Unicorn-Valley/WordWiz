import { supabase } from "../config/supabase";
import { User, AuthError } from "../types/auth.types";

/**
 * Supabase 인증 서비스
 */
class AuthService {
  /**
   * 로그아웃
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 현재 사용자 정보 가져오기
   */
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar: user.user_metadata?.avatar_url,
      created_at: user.created_at,
    };
  }

  /**
   * 에러 처리
   */
  private handleError(error: any): AuthError {
    console.error("Auth error:", error);

    return {
      message: error.message || "인증 오류가 발생했습니다.",
      code: error.code,
    };
  }
}

export const authService = new AuthService();
