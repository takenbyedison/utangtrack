export type LoanStatus =
  | "pending confirmation"
  | "confirmed"
  | "disputed"
  | "active"
  | "overdue"
  | "partially paid"
  | "paid";

export type Borrower = {
  id: string;
  lenderId: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export type Loan = {
  id: string;
  lenderId: string;
  borrowerId: string;
  principal: number;
  balance: number;
  dueDate: string;
  purpose: string;
  status: LoanStatus;
  borrowerResponse?: "confirmed" | "disputed";
  disputeReason?: string;
};

export type Payment = {
  id: string;
  loanId: string;
  amount: number;
  paidAt: string;
  note: string;
};

export type Reminder = {
  id: string;
  loanId: string;
  channel: "mock";
  message: string;
  sentAt: string;
};
