"use client";

import { useTransition } from "react";
import { approveAccessRequestAction, rejectAccessRequestAction } from "./actions";

type Props = { requestId: string };

export function ApproveRejectButtons({ requestId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(() => {
      void approveAccessRequestAction(requestId);
    });
  }

  function handleReject() {
    startTransition(() => {
      void rejectAccessRequestAction(requestId);
    });
  }

  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        onClick={handleApprove}
        disabled={isPending}
        className="btn-primary py-2 px-4 text-sm"
      >
        {isPending ? "..." : "אישור"}
      </button>
      <button
        type="button"
        onClick={handleReject}
        disabled={isPending}
        className="btn-secondary py-2 px-4 text-sm"
      >
        דחייה
      </button>
    </div>
  );
}
