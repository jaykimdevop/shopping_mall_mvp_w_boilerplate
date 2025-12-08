"use client";

/**
 * @file components/admin/bulk-tracking-modal.tsx
 * @description 운송장 일괄 입력 모달 컴포넌트
 *
 * 배송 대기 상태의 주문에 대해 운송장 번호를 일괄 입력할 수 있습니다.
 */

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Package, Truck } from "lucide-react";
import { getShippingList, bulkUpdateTracking } from "@/actions/admin/shipping";
import type { ShippingCarrier, ShippingOrder, TrackingInput } from "@/types/order";
import { SHIPPING_CARRIER_LABELS, SHIPPING_CARRIERS } from "@/types/order";
import { toast } from "sonner";

interface BulkTrackingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface TrackingEntry {
  orderId: string;
  trackingNumber: string;
  carrier: ShippingCarrier;
  selected: boolean;
}

export default function BulkTrackingModal({
  open,
  onClose,
  onSuccess,
}: BulkTrackingModalProps) {
  const [orders, setOrders] = useState<ShippingOrder[]>([]);
  const [entries, setEntries] = useState<Map<string, TrackingEntry>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [defaultCarrier, setDefaultCarrier] = useState<ShippingCarrier>("cj");

  // 배송 대기 주문 로드
  const loadPendingOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getShippingList({
        shippingStatus: "pending_shipment",
        limit: 100, // 최대 100건까지
      });

      setOrders(result.orders);

      // 엔트리 초기화
      const newEntries = new Map<string, TrackingEntry>();
      result.orders.forEach((order) => {
        newEntries.set(order.id, {
          orderId: order.id,
          trackingNumber: "",
          carrier: defaultCarrier,
          selected: false,
        });
      });
      setEntries(newEntries);
    } catch (error) {
      console.error("Failed to load pending orders:", error);
      toast.error("배송 대기 주문을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [defaultCarrier]);

  useEffect(() => {
    if (open) {
      loadPendingOrders();
    }
  }, [open, loadPendingOrders]);

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    const newEntries = new Map(entries);
    newEntries.forEach((entry) => {
      entry.selected = checked;
    });
    setEntries(newEntries);
  };

  // 개별 선택
  const handleSelectOne = (orderId: string, checked: boolean) => {
    const newEntries = new Map(entries);
    const entry = newEntries.get(orderId);
    if (entry) {
      entry.selected = checked;
      setEntries(newEntries);
    }
  };

  // 운송장 번호 변경
  const handleTrackingChange = (orderId: string, trackingNumber: string) => {
    const newEntries = new Map(entries);
    const entry = newEntries.get(orderId);
    if (entry) {
      entry.trackingNumber = trackingNumber;
      // 운송장 번호 입력 시 자동 선택
      if (trackingNumber.trim()) {
        entry.selected = true;
      }
      setEntries(newEntries);
    }
  };

  // 배송 업체 변경
  const handleCarrierChange = (orderId: string, carrier: ShippingCarrier) => {
    const newEntries = new Map(entries);
    const entry = newEntries.get(orderId);
    if (entry) {
      entry.carrier = carrier;
      setEntries(newEntries);
    }
  };

  // 기본 배송 업체 일괄 변경
  const handleDefaultCarrierChange = (carrier: ShippingCarrier) => {
    setDefaultCarrier(carrier);
    const newEntries = new Map(entries);
    newEntries.forEach((entry) => {
      entry.carrier = carrier;
    });
    setEntries(newEntries);
  };

  // 저장
  const handleSave = async () => {
    // 선택되고 운송장 번호가 입력된 항목만 필터링
    const itemsToSave: TrackingInput[] = [];
    entries.forEach((entry) => {
      if (entry.selected && entry.trackingNumber.trim()) {
        itemsToSave.push({
          orderId: entry.orderId,
          trackingNumber: entry.trackingNumber.trim(),
          carrier: entry.carrier,
        });
      }
    });

    if (itemsToSave.length === 0) {
      toast.error("저장할 운송장 정보가 없습니다. 운송장 번호를 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await bulkUpdateTracking({ items: itemsToSave });

      if (result.success) {
        toast.success(result.message);
        onSuccess();
      } else {
        toast.error(result.message);
        if (result.errors && result.errors.length > 0) {
          console.error("Bulk tracking errors:", result.errors);
        }
      }
    } catch (error) {
      console.error("Failed to save tracking:", error);
      toast.error("운송장 번호 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 선택된 항목 수
  const selectedCount = Array.from(entries.values()).filter(
    (e) => e.selected && e.trackingNumber.trim()
  ).length;

  // 전체 선택 여부
  const isAllSelected =
    orders.length > 0 &&
    Array.from(entries.values()).every((e) => e.selected);

  // 주문번호 포맷
  const formatOrderId = (id: string) => {
    return id.substring(0, 8).toUpperCase();
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            운송장 일괄 입력
          </DialogTitle>
          <DialogDescription>
            배송 대기 중인 주문에 운송장 번호를 일괄 입력합니다.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              배송 대기 중인 주문이 없습니다.
            </p>
          </div>
        ) : (
          <>
            {/* 일괄 설정 */}
            <div className="flex items-center justify-between gap-4 py-2 border-b dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(checked) =>
                      handleSelectAll(checked as boolean)
                    }
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    전체 선택
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    기본 배송업체:
                  </span>
                  <Select
                    value={defaultCarrier}
                    onValueChange={(v) =>
                      handleDefaultCarrierChange(v as ShippingCarrier)
                    }
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIPPING_CARRIERS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {SHIPPING_CARRIER_LABELS[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedCount}건 선택됨
              </span>
            </div>

            {/* 주문 목록 */}
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="w-24">주문번호</TableHead>
                    <TableHead className="w-20">주문일</TableHead>
                    <TableHead>수령인</TableHead>
                    <TableHead className="w-32">배송업체</TableHead>
                    <TableHead className="w-44">운송장번호</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const entry = entries.get(order.id);
                    if (!entry) return null;

                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Checkbox
                            checked={entry.selected}
                            onCheckedChange={(checked) =>
                              handleSelectOne(order.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          #{formatOrderId(order.id)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {order.recipient_name || "-"}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              {order.recipient_address || "-"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={entry.carrier}
                            onValueChange={(v) =>
                              handleCarrierChange(order.id, v as ShippingCarrier)
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SHIPPING_CARRIERS.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {SHIPPING_CARRIER_LABELS[c]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={entry.trackingNumber}
                            onChange={(e) =>
                              handleTrackingChange(order.id, e.target.value)
                            }
                            placeholder="운송장 번호 입력"
                            className="h-8 text-sm"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <DialogFooter className="border-t pt-4 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || selectedCount === 0}
            className="bg-[#00A2FF] hover:bg-[#0090e0]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              `${selectedCount}건 저장`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

