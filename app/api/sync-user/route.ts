import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Clerk 사용자를 Supabase users 테이블에 동기화하는 API
 *
 * 클라이언트에서 로그인 후 이 API를 호출하여 사용자 정보를 Supabase에 저장합니다.
 * 이미 존재하는 경우 업데이트하고, 없으면 새로 생성합니다.
 *
 * 동기화되는 정보:
 * - clerk_id: Clerk 사용자 ID
 * - name: 사용자 이름 (fullName > username > email)
 * - email: 사용자 이메일 주소
 *
 * 참고: 사용자 역할(role)은 Clerk publicMetadata에서 관리합니다.
 * 사용자 등급(tier)은 Supabase users 테이블에서 관리합니다.
 */
export async function POST() {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clerk에서 사용자 정보 가져오기
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 이메일 주소 추출
    const primaryEmail = clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || null;

    // Supabase에 사용자 정보 동기화
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          clerk_id: clerkUser.id,
          name:
            clerkUser.fullName ||
            clerkUser.username ||
            primaryEmail ||
            "Unknown",
          email: primaryEmail,
        },
        {
          onConflict: "clerk_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase sync error:", error);
      return NextResponse.json(
        { error: "Failed to sync user", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data,
    });
  } catch (error) {
    console.error("Sync user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
