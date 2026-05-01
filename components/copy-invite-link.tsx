"use client";

import { useState } from "react";

export function CopyInviteLink({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function copyInviteLink() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
  }

  return (
    <button
      className="focus-ring rounded border border-ink/15 px-4 py-2 font-semibold text-ink"
      onClick={copyInviteLink}
      type="button"
    >
      {copied ? "Copied" : "Copy invite link"}
    </button>
  );
}
