/**
 * @file scripts/check-tables.ts
 * @description Supabase 테이블 존재 여부 확인 스크립트
 */

import { getServiceRoleClient } from "../lib/supabase/service-role";

async function checkTables() {
  const supabase = getServiceRoleClient();

  console.log("🔍 Checking Supabase tables...\n");

  // 1. banners 테이블 확인
  console.log("1. Checking 'banners' table...");
  const { data: bannersData, error: bannersError } = await supabase
    .from("banners")
    .select("id")
    .limit(1);

  if (bannersError) {
    if (bannersError.code === "42P01" || bannersError.message?.includes("does not exist")) {
      console.error("❌ banners 테이블이 없습니다!");
      console.log("   → supabase/migrations/20251206000000_create_banners_and_generated_images.sql 파일을 실행해주세요.\n");
    } else {
      console.error("❌ Error:", bannersError.message);
    }
  } else {
    console.log("✅ banners 테이블이 존재합니다.\n");
  }

  // 2. generated_images 테이블 확인
  console.log("2. Checking 'generated_images' table...");
  const { data: imagesData, error: imagesError } = await supabase
    .from("generated_images")
    .select("id")
    .limit(1);

  if (imagesError) {
    if (imagesError.code === "42P01" || imagesError.message?.includes("does not exist")) {
      console.error("❌ generated_images 테이블이 없습니다!");
      console.log("   → supabase/migrations/20251206000000_create_banners_and_generated_images.sql 파일을 실행해주세요.\n");
    } else {
      console.error("❌ Error:", imagesError.message);
    }
  } else {
    console.log("✅ generated_images 테이블이 존재합니다.\n");
  }

  // 3. products 테이블 확인
  console.log("3. Checking 'products' table...");
  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("id")
    .limit(1);

  if (productsError) {
    if (productsError.code === "42P01" || productsError.message?.includes("does not exist")) {
      console.error("❌ products 테이블이 없습니다!");
    } else {
      console.error("❌ Error:", productsError.message);
    }
  } else {
    console.log("✅ products 테이블이 존재합니다.\n");
  }

  console.log("\n✨ Check completed!");
}

checkTables().catch(console.error);
