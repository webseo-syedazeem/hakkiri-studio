"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button, ButtonLink, Icon } from "@/components/ui";

export function AccountControls() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-4">
      <div className="rounded-[12px] bg-panel-2 p-4 border border-line">
        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[15px] font-semibold text-ink">
                {user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Studio User"}
              </div>
              <div className="text-[13px] text-muted">{user.email}</div>
            </div>
            <div className="flex items-center gap-2.5">
              <ButtonLink href="/landing" variant="secondary" size="sm">
                Preview Homepage
              </ButtonLink>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void logout()}
                className="text-red-soft hover:bg-red/10 border-red/20"
              >
                <Icon name="x" size={14} />
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[15px] font-semibold text-ink">Studio Session</div>
              <div className="text-[13px] text-muted">You are currently using the app without a signed-in account.</div>
            </div>
            <div className="flex items-center gap-2.5">
              <ButtonLink href="/landing" variant="secondary" size="sm">
                Preview Homepage
              </ButtonLink>
              <ButtonLink href="/login" variant="primary" size="sm">
                Sign In
              </ButtonLink>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Link href="/landing" className="font-semibold text-blue-soft underline-offset-2 hover:underline">
          Public Homepage (Interviews)
        </Link>
        <Link href="/present" className="font-semibold text-blue-soft underline-offset-2 hover:underline">
          Public Homepage (Presentations)
        </Link>
        <Link href="/privacy" className="text-muted underline-offset-2 hover:underline">
          Privacy policy
        </Link>
        <Link href="/terms" className="text-muted underline-offset-2 hover:underline">
          Terms
        </Link>
      </div>
    </div>
  );
}
