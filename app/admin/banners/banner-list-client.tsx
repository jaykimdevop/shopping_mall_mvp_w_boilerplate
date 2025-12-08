/**
 * @file app/admin/banners/banner-list-client.tsx
 * @description 배너 목록 클라이언트 컴포넌트
 *
 * 드래그 앤 드롭 순서 변경, 활성화 토글, 삭제 기능을 제공합니다.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  GripVertical,
  Pencil,
  Trash2,
  ImageIcon,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  toggleBannerStatus,
  deleteBanner,
  reorderBanners,
} from "@/actions/admin/banner";
import type { BannerWithProduct } from "@/types/banner";

interface BannerListClientProps {
  initialBanners: BannerWithProduct[];
}

export default function BannerListClient({ initialBanners }: BannerListClientProps) {
  const router = useRouter();
  const [banners, setBanners] = useState(initialBanners);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // 활성화 토글
  const handleToggleStatus = async (id: string) => {
    try {
      const newStatus = await toggleBannerStatus(id);
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, is_active: newStatus } : b))
      );
      toast.success(newStatus ? "배너가 활성화되었습니다." : "배너가 비활성화되었습니다.");
    } catch (error) {
      console.error("Toggle status error:", error);
      toast.error("상태 변경에 실패했습니다.");
    }
  };

  // 삭제 다이얼로그 열기
  const handleDeleteClick = (id: string) => {
    setBannerToDelete(id);
    setDeleteDialogOpen(true);
  };

  // 삭제 확인
  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return;

    setIsDeleting(true);
    try {
      await deleteBanner(bannerToDelete);
      setBanners((prev) => prev.filter((b) => b.id !== bannerToDelete));
      toast.success("배너가 삭제되었습니다.");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("배너 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
    }
  };

  // 드래그 시작
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // 드래그 오버
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBanners = [...banners];
    const [draggedItem] = newBanners.splice(draggedIndex, 1);
    newBanners.splice(index, 0, draggedItem);

    setBanners(newBanners);
    setDraggedIndex(index);
  };

  // 드래그 종료
  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    setDraggedIndex(null);

    // 서버에 순서 저장
    try {
      await reorderBanners(banners.map((b) => b.id));
      toast.success("순서가 변경되었습니다.");
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error("순서 변경에 실패했습니다.");
      // 실패 시 원래 순서로 복원
      router.refresh();
    }
  };

  if (banners.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border">
        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          등록된 배너가 없습니다
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          새 배너를 추가하여 홈페이지 슬라이더에 표시하세요.
        </p>
        <Link href="/admin/banners/new">
          <Button className="bg-[#00A2FF] hover:bg-[#0090e0]">
            새 배너 추가
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground mb-4">
          드래그하여 배너 순서를 변경할 수 있습니다.
        </p>

        {banners.map((banner, index) => (
          <div
            key={banner.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border transition-all ${
              draggedIndex === index
                ? "opacity-50 border-primary"
                : "hover:border-gray-300 dark:hover:border-gray-600"
            } ${!banner.is_active ? "opacity-60" : ""}`}
          >
            {/* 드래그 핸들 */}
            <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
              <GripVertical className="w-5 h-5" />
            </div>

            {/* 배너 이미지/미리보기 */}
            <div className="relative w-32 h-20 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
              {banner.image_url ? (
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              ) : banner.bg_color ? (
                <div className={`w-full h-full bg-gradient-to-r ${banner.bg_color} flex items-center justify-center`}>
                  <span className="text-white text-xs font-medium px-2 text-center line-clamp-2">
                    {banner.title}
                  </span>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* 배너 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {banner.title}
                </h3>
                {!banner.is_active && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                    비활성
                  </span>
                )}
              </div>
              {banner.subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {banner.subtitle}
                </p>
              )}
              {banner.product && (
                <p className="text-xs text-primary mt-1">
                  연결 상품: {banner.product.name}
                </p>
              )}
            </div>

            {/* 활성화 토글 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {banner.is_active ? "활성" : "비활성"}
              </span>
              <Switch
                checked={banner.is_active}
                onCheckedChange={() => handleToggleStatus(banner.id)}
              />
            </div>

            {/* 액션 메뉴 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/banners/${banner.id}/edit`}>
                    <Pencil className="w-4 h-4 mr-2" />
                    수정
                  </Link>
                </DropdownMenuItem>
                {banner.cta_link && (
                  <DropdownMenuItem asChild>
                    <Link href={banner.cta_link} target="_blank">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      링크 열기
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(banner.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>배너를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 배너와 연결된 이미지도 함께 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

